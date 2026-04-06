import { getSupabaseAdmin } from '@/utils/supabase/admin';
import { areIntervalsOverlapping, startOfDay, addDays } from 'date-fns';

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

    return newBooking;
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
