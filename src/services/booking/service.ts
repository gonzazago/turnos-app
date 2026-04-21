import { getSupabaseAdmin } from '@/utils/supabase/admin';

import { areIntervalsOverlapping, startOfDay, addDays, subMonths, addMonths, differenceInHours } from 'date-fns';
import { generateCancelToken } from '@/utils/tokens';

export interface CreateBookingParams {
  profileId: string;
  eventTypeId: string;
  bookerName: string;
  bookerEmail: string;
  startTime: string;
  endTime: string;
  requiresDeposit: boolean;
}

export class BookingService {
  static async getProviderDashboardBookings(userId: string) {
    const supabase = await getSupabaseAdmin();
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, start_time, end_time, booker_name, booker_email, status, payment_status,
        event_types (title, duration_mins, requires_deposit, total_price, deposit_percentage)
      `)
      .eq('user_id', userId)
      .gte('start_time', subMonths(new Date(), 3).toISOString())
      .lte('start_time', addMonths(new Date(), 6).toISOString())
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async getBookingsForDateRange(userId: string, email: string, startDate: string, endDate: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('user_id', userId)
      .eq('booker_email', email)
      .gte('start_time', startDate)
      .lt('start_time', endDate);
    if (error) throw error;
    return data;
  }

  static async checkExactBookingExists(userId: string, email: string, startTime: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('user_id', userId)
      .eq('booker_email', email)
      .eq('start_time', startTime)
      .limit(1);
    if (error) throw error;
    return data && data.length > 0;
  }

  static async getOverlappingBookings(userId: string, startTime: string, endTime: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('id, start_time, end_time')
      .eq('user_id', userId)
      .gte('end_time', startTime)
      .lte('start_time', endTime);
    if (error) throw error;
    return data;
  }

  static async insertBooking(bookingData: Record<string, unknown>) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(bookingId: string, updateData: Record<string, unknown>) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async create(params: CreateBookingParams) {
    // 1. Rate limit check: one booking per day per email
    const startTimeDate = new Date(params.startTime);
    const bookingDate = startOfDay(startTimeDate).toISOString();
    const nextDay = addDays(startOfDay(startTimeDate), 1).toISOString();

    const dailyBookings = await this.getBookingsForDateRange(params.profileId, params.bookerEmail, bookingDate, nextDay);

    if (dailyBookings && dailyBookings.length > 0) {
      throw new Error('Ya tienes una reserva para este día. Solo se permite una reserva por día.');
    }

    // 2. Availability check: verify no overlapping bookings
    const existingBookings = await this.getOverlappingBookings(params.profileId, params.startTime, params.endTime);

    if (existingBookings && existingBookings.length > 0) {
      const isOverlapping = existingBookings.some((booking) => 
        areIntervalsOverlapping(
          { start: new Date(params.startTime), end: new Date(params.endTime) },
          { start: new Date(booking.start_time), end: new Date(booking.end_time) }
        )
      );

      if (isOverlapping) {
        throw new Error('Lo sentimos, este horario ya ha sido reservado. Por favor, selecciona otro.');
      }
    }

    // 3. Create the booking
    let newBooking;
    try {
      newBooking = await this.insertBooking({
        user_id: params.profileId,
        event_type_id: params.eventTypeId,
        booker_name: params.bookerName,
        booker_email: params.bookerEmail,
        start_time: params.startTime,
        end_time: params.endTime,
        status: params.requiresDeposit ? 'pending_payment' : 'confirmed',
        payment_status: params.requiresDeposit ? 'pending' : 'paid'
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === '23P01') {
        throw new Error('Lo sentimos, este horario ya ha sido reservado. Por favor, selecciona otro.');
      }
      throw new Error('Ocurrió un error al procesar tu reserva.');
    }

    // 3.5 Generate and store cancellation token
    const cancelToken = generateCancelToken(newBooking.id);
    const finalBooking = await this.update(newBooking.id, { cancel_token: cancelToken });

    // 4. Google Calendar Sync
    try {
      const supabaseAdmin = getSupabaseAdmin();
      // Get event type details to check if it's virtual
      const { data: eventType } = await supabaseAdmin
        .from('event_types')
        .select('title, description, duration_mins')
        .eq('id', params.eventTypeId)
        .single();

      const { CalendarService } = await import('../calendar/service');
      const googleEvent = await CalendarService.createBookingEvent(params.profileId, {
        summary: `${eventType?.title || 'Reserva'} - ${params.bookerName}`,
        description: `Reserva realizada a través de Turnos App.\n\nCliente: ${params.bookerName}\nEmail: ${params.bookerEmail}`,
        start_time: params.startTime,
        end_time: params.endTime,
        booker_email: params.bookerEmail,
        is_virtual: true, // We could make this dynamic based on event type if we had the field
        booking_id: finalBooking.id,
        cancel_token: cancelToken
      });

      if (googleEvent) {
        await this.update(finalBooking.id, {
          google_event_id: googleEvent.id,
          google_meet_link: googleEvent.hangoutLink
        });
      }
    } catch (err) {
      console.error('Error in Google Calendar sync during booking creation:', err);
    }

    return finalBooking;
  }

  static async getById(bookingId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*, event_types(*), profiles(*)')
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return data;
  }

  static async getActiveBookingByEmail(profileId: string, email: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*, event_types(*)')
      .eq('user_id', profileId)
      .eq('booker_email', email)
      .in('status', ['confirmed', 'pending_payment'])
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getUpcomingBookingsForReminders(startDate: string, endDate: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('id, start_time, booker_name, user_id, profiles!inner(phone, plan_type, full_name)')
      .eq('status', 'confirmed')
      .gte('start_time', startDate)
      .lte('start_time', endDate);

    if (error) throw error;
    return data;
  }

  static async getConfirmedBookingsWithGoogleId(userId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('id, google_event_id')
      .eq('user_id', userId)
      .not('google_event_id', 'is', null)
      .eq('status', 'confirmed');

    if (error) throw error;
    return data;
  }

  static async updateStatus(bookingId: string, status: string, paymentStatus: string, paymentId?: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const updateData: Record<string, unknown> = { status, payment_status: paymentStatus };
    if (paymentId) updateData.payment_id = paymentId;
    
    return supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId);
  }

  static async updatePreferenceId(bookingId: string, preferenceId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    return supabaseAdmin
      .from('bookings')
      .update({ mercado_pago_preference_id: preferenceId })
      .eq('id', bookingId);
  }

  static async cancel(bookingId: string, userId: string) {
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Get booking to check for google_event_id
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('google_event_id')
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();

    if (booking?.google_event_id) {
      const { CalendarService } = await import('../calendar/service');
      await CalendarService.deleteBookingEvent(userId, booking.google_event_id);
    }

    return supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', bookingId)
      .eq('user_id', userId);
  }

  static async reschedule(bookingId: string, userId: string, startTime: string, endTime: string, initiatedBy: 'provider' | 'client' = 'provider') {
    const supabaseAdmin = getSupabaseAdmin();
    
    // 1. Fetch booking with profile policy
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*, profiles(reschedule_limit_hours)')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) throw new Error('Booking not found');

    // 2. Validate policy if initiated by client
    if (initiatedBy === 'client') {
      const limitHours = booking.profiles?.reschedule_limit_hours ?? 24;
      const hoursToEvent = differenceInHours(new Date(booking.start_time), new Date());
      
      if (hoursToEvent < limitHours) {
        throw new Error(`Las reprogramaciones solo están permitidas hasta ${limitHours} horas antes del turno.`);
      }
    }

    // 3. Check for overlaps in new time (excluding current booking)
    const overlaps = await this.getOverlappingBookings(booking.user_id, startTime, endTime);
    const hasOverlap = overlaps.some(o => o.id !== bookingId);
    if (hasOverlap) {
      throw new Error('El nuevo horario seleccionado ya está ocupado.');
    }

    // 4. Update Database
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ 
        start_time: startTime, 
        end_time: endTime 
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 5. Update Google Calendar
    if (booking.google_event_id) {
      console.log(`Reschedule: found google_event_id ${booking.google_event_id}, triggering sync...`);
      try {
        const { CalendarService } = await import('../calendar/service');
        await CalendarService.updateBookingEvent(booking.user_id, booking.google_event_id, {
          start_time: startTime,
          end_time: endTime
        });
      } catch (calError) {
        console.error('Error updating Google Calendar during reschedule:', calError);
      }
    }

    return updatedBooking;
  }

  static async syncWithGoogleCalendar(userId: string) {
    try {
      const { CalendarService } = await import('../calendar/service');
      const timeMin = new Date().toISOString();
      const timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + 30);
      
      const events = await CalendarService.getGoogleEvents(userId, timeMin, timeMax.toISOString());
      await CalendarService.syncBusySlots(userId, events);

      // Handle cancelled synchronized events (Turnos -> Google)
      const syncedBookings = await this.getConfirmedBookingsWithGoogleId(userId);
      const confirmedGoogleIds = new Set(events.filter((e: { status: string; id: string }) => e.status === 'confirmed').map((e: { id: string }) => e.id));

      if (syncedBookings) {
        for (const booking of syncedBookings) {
          if (!confirmedGoogleIds.has(booking.google_event_id)) {
            const cancelledEvent = events.find((e: { status: string; id: string }) => e.id === booking.google_event_id && e.status === 'cancelled');

            if (cancelledEvent) {
              console.log('Synchronized event cancelled in Google, cancelling Turnos booking:', booking.id);
              const { CancellationService } = await import('./cancellation');
              await CancellationService.processCancellation(booking.id, 'provider');
            }
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      return false;
    }
  }
}

