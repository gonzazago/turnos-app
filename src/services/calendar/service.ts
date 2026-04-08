import { getSupabaseAdmin } from '@/utils/supabase/admin';
import { GoogleCalendarService } from './google';
import { BookingService } from '../booking/service';
import { CancellationService } from '../booking/cancellation';

export const CalendarService = {
  async getGoogleTokens(userId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data;
  },

  async getAccessToken(userId: string) {
    const tokens = await this.getGoogleTokens(userId);
    if (!tokens) throw new Error('Google Calendar not connected');

    const expiresAt = new Date(tokens.expires_at);
    const now = new Date();
    const buffer = 5 * 60 * 1000; // 5 minutes buffer

    if (expiresAt.getTime() - now.getTime() > buffer) {
      return tokens.access_token;
    }

    // Refresh token
    const googleService = new GoogleCalendarService();
    const result = await googleService.refreshToken(tokens.refresh_token);

    const newExpiresAt = new Date();
    newExpiresAt.setSeconds(newExpiresAt.getSeconds() + result.expires_in);

    const supabaseAdmin = getSupabaseAdmin();
    const { data: updatedTokens, error: updateError } = await supabaseAdmin
      .from('google_calendar_tokens')
      .update({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_at: newExpiresAt.toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return updatedTokens.access_token;
  },

  async createBookingEvent(userId: string, booking: {
    summary: string;
    description?: string;
    start_time: string;
    end_time: string;
    booker_email: string;
    is_virtual?: boolean;
    booking_id: string;
    cancel_token: string;
  }) {
    try {
      const accessToken = await this.getAccessToken(userId);
      const googleService = new GoogleCalendarService();

      const cancelLink = `${process.env.NEXT_PUBLIC_APP_URL}/cancel/${booking.booking_id}?t=${booking.cancel_token}`;
      const fullDescription = `${booking.description || ''}\n\nPara cancelar esta cita, haz clic aquí: ${cancelLink}`;

      const event = await googleService.createEvent(accessToken, {
        summary: booking.summary,
        description: fullDescription,
        start: { dateTime: booking.start_time, timeZone: 'UTC' },
        end: { dateTime: booking.end_time, timeZone: 'UTC' },
        attendees: [{ email: booking.booker_email }],
        conferenceData: booking.is_virtual,
      });

      return event;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      // We don't fail the booking if calendar sync fails, but we log it
      return null;
    }
  },

  async deleteBookingEvent(userId: string, googleEventId: string) {
    try {
      const accessToken = await this.getAccessToken(userId);
      const googleService = new GoogleCalendarService();
      await googleService.deleteEvent(accessToken, googleEventId);
      return true;
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      return false;
    }
  },

  async setupWebhook(userId: string) {
    try {
      const accessToken = await this.getAccessToken(userId);
      const googleService = new GoogleCalendarService();
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
      const callbackUrl = `${baseUrl}/api/webhooks/google-calendar`;

      const subscription = await googleService.subscribeToCalendar(accessToken, callbackUrl);

      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin
        .from('google_calendar_tokens')
        .update({
          webhook_id: subscription.webhook_id,
          webhook_resource_id: subscription.webhook_resource_id,
          webhook_expiration: subscription.webhook_expiration,
        })
        .eq('user_id', userId);

      return true;
    } catch (error) {
      console.error('Error setting up Google Calendar webhook:', error);
      return false;
    }
  },

  async stopWebhook(userId: string) {
    try {
      const tokens = await this.getGoogleTokens(userId);
      if (!tokens || !tokens.webhook_id || !tokens.webhook_resource_id) return true;

      const accessToken = await this.getAccessToken(userId);
      const googleService = new GoogleCalendarService();

      await googleService.unsubscribeFromCalendar(
        accessToken, 
        tokens.webhook_id, 
        tokens.webhook_resource_id
      );

      return true;
    } catch (error) {
      console.error('Error stopping Google Calendar webhook:', error);
      return false;
    }
  },

  async syncCalendarEvents(userId: string) {
    try {
      const accessToken = await this.getAccessToken(userId);
      const googleService = new GoogleCalendarService();

      // Fetch events from now to 30 days in the future
      const timeMin = new Date().toISOString();
      const timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + 30);

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax.toISOString()}&singleEvents=true`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error('Failed to fetch Google events');

      const events = data.items || [];
      const supabaseAdmin = getSupabaseAdmin();

      // 1. Delete old busy slots for this user
      await supabaseAdmin
        .from('google_busy_slots')
        .delete()
        .eq('user_id', userId);

      // 2. Insert new busy slots
      // Note: We only include events that are confirmed and not "transparent" (which means they don't block time)
      const busySlots = events
        .filter((event: any) => event.status === 'confirmed' && event.transparency !== 'transparent')
        .map((event: any) => ({
          user_id: userId,
          google_event_id: event.id,
          start_time: event.start.dateTime || event.start.date, // Google uses date for all-day events
          end_time: event.end.dateTime || event.end.date,
        }));

      if (busySlots.length > 0) {
        await supabaseAdmin
          .from('google_busy_slots')
          .insert(busySlots);
      }

      // 3. Handle cancelled synchronized events (Turnos -> Google)
      const { data: syncedBookings } = await supabaseAdmin
        .from('bookings')
        .select('id, google_event_id')
        .eq('user_id', userId)
        .not('google_event_id', 'is', null)
        .eq('status', 'confirmed');

      const confirmedGoogleIds = new Set(events.filter((e: any) => e.status === 'confirmed').map((e: any) => e.id));

      if (syncedBookings) {
        for (const booking of syncedBookings) {
          if (!confirmedGoogleIds.has(booking.google_event_id)) {
            // Check if it's really cancelled in Google
            const cancelledEvent = events.find((e: any) => e.id === booking.google_event_id && e.status === 'cancelled');
            
            if (cancelledEvent) {
              console.log('Synchronized event cancelled in Google, cancelling Turnos booking:', booking.id);
              // Use CancellationService to handle refund and notifications
              await CancellationService.processCancellation(booking.id, 'provider');
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error syncing Google Calendar events:', error);
      return false;
    }
  }
};
