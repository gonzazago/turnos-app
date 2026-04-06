import { getSupabaseAdmin } from '@/utils/supabase/admin';
import { GoogleCalendarService } from './google';

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
  }) {
    try {
      const accessToken = await this.getAccessToken(userId);
      const googleService = new GoogleCalendarService();

      const event = await googleService.createEvent(accessToken, {
        summary: booking.summary,
        description: booking.description,
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
  }
};
