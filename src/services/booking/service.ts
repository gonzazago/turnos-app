import { getSupabaseAdmin } from '@/utils/supabase/admin';
import { areIntervalsOverlapping, startOfDay, addDays } from 'date-fns';
import { CalendarService } from '../calendar/service';
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
  static async create(params: CreateBookingParams) {
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Rate limit check: one booking per day per email
    const startTimeDate = new Date(params.startTime);
    const bookingDate = startOfDay(startTimeDate).toISOString();
    const nextDay = addDays(startOfDay(startTimeDate), 1).toISOString();

    const { data: dailyBookings } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('user_id', params.profileId)
      .eq('booker_email', params.bookerEmail)
      .gte('start_time', bookingDate)
      .lt('start_time', nextDay);

    if (dailyBookings && dailyBookings.length > 0) {
      throw new Error('Ya tienes una reserva para este día. Solo se permite una reserva por día.');
    }

    // 2. Availability check: verify no overlapping bookings
    const { data: existingBookings } = await supabaseAdmin
      .from('bookings')
      .select('start_time, end_time')
      .eq('user_id', params.profileId)
      .gte('end_time', params.startTime)
      .lte('start_time', params.endTime);

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
    const { data: newBooking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        user_id: params.profileId,
        event_type_id: params.eventTypeId,
        booker_name: params.bookerName,
        booker_email: params.bookerEmail,
        start_time: params.startTime,
        end_time: params.endTime,
        status: params.requiresDeposit ? 'pending_payment' : 'confirmed',
        payment_status: params.requiresDeposit ? 'pending' : 'paid'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23P01') {
        throw new Error('Lo sentimos, este horario ya ha sido reservado. Por favor, selecciona otro.');
      }
      throw new Error('Ocurrió un error al procesar tu reserva.');
    }

    // 3.5 Generate and store cancellation token
    const cancelToken = generateCancelToken(newBooking.id);
    const { data: updatedBooking } = await supabaseAdmin
      .from('bookings')
      .update({ cancel_token: cancelToken })
      .eq('id', newBooking.id)
      .select()
      .single();

    const finalBooking = updatedBooking || newBooking;

    // 4. Google Calendar Sync
    try {
      // Get event type details to check if it's virtual
      const { data: eventType } = await supabaseAdmin
        .from('event_types')
        .select('title, description, duration_mins')
        .eq('id', params.eventTypeId)
        .single();

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
        await supabaseAdmin
          .from('bookings')
          .update({
            google_event_id: googleEvent.id,
            google_meet_link: googleEvent.hangoutLink
          })
          .eq('id', finalBooking.id);
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

  static async updateStatus(bookingId: string, status: string, paymentStatus: string) {
    const supabaseAdmin = getSupabaseAdmin();
    return supabaseAdmin
      .from('bookings')
      .update({ status, payment_status: paymentStatus })
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
      await CalendarService.deleteBookingEvent(userId, booking.google_event_id);
    }

    return supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', bookingId)
      .eq('user_id', userId);
  }

  static async reschedule(bookingId: string, userId: string, startTime: string, endTime: string) {
    const supabaseAdmin = getSupabaseAdmin();
    return supabaseAdmin
      .from('bookings')
      .update({ start_time: startTime, end_time: endTime })
      .eq('id', bookingId)
      .eq('user_id', userId);
  }
}
