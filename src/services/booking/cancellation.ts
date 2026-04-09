import { getSupabaseAdmin } from '@/utils/supabase/admin';
import { BookingService } from './service';
import { PaymentService } from '../payment/service';
import { calculateRefund } from '@/utils/refunds';
import { sendBookingCancellationEmail } from '@/utils/notifications';
import { WhatsAppService } from '../notifications/WhatsAppService';

export class CancellationService {
  /**
   * Processes a booking cancellation, calculates and executes refund, and notifies parties.
   */
  static async processCancellation(
    bookingId: string, 
    initiatedBy: 'provider' | 'client',
    cancelToken?: string
  ) {
    // 1. Fetch booking with related data
    let booking;
    try {
      booking = await BookingService.getById(bookingId);
    } catch (err) {
      throw new Error('Booking not found');
    }

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'cancelled') {
      return { success: true, alreadyCancelled: true };
    }

    // 2. Validate token if initiated by client
    if (initiatedBy === 'client' && cancelToken && booking.cancel_token !== cancelToken) {
      throw new Error('Invalid cancellation token');
    }

    // 3. Calculate refund
    let refundPercentage = 100;
    if (initiatedBy === 'client') {
      const refundInfo = calculateRefund(booking.profiles.refund_rules || [], new Date(booking.start_time));
      refundPercentage = refundInfo.percentage;
    }

    let totalPaid = 0;
    if (booking.payment_status === 'paid' && booking.event_types?.requires_deposit) {
      totalPaid = (Number(booking.event_types.total_price) * Number(booking.event_types.deposit_percentage)) / 100;
    }

    const refundAmount = (totalPaid * refundPercentage) / 100;

    // 4. Execute Refund via Mercado Pago if applicable
    let refundResult = null;
    if (refundAmount > 0 && booking.payment_id) {
      try {
        const accessToken = await PaymentService.getValidAccessToken(booking.user_id, 'mercadopago');
        const mpProvider = PaymentService.getProvider('mercadopago');
        refundResult = await mpProvider.refundPayment(accessToken, booking.payment_id, refundAmount);
      } catch (err) {
        console.error('Error processing refund via MP:', err);
        // We might want to handle this differently (e.g. mark as manual refund needed)
      }
    }

    // 5. Update Booking Status
    try {
      await BookingService.update(bookingId, { 
        status: 'cancelled', 
        payment_status: refundAmount > 0 ? 'refunded' : booking.payment_status,
        refund_data: {
          amount: refundAmount,
          percentage: refundPercentage,
          initiated_by: initiatedBy,
          refund_id: refundResult?.id || null,
          processed_at: new Date().toISOString()
        }
      });
    } catch (updateError) {
      throw updateError;
    }

    // 6. Delete Google Calendar Event
    if (booking.google_event_id) {
      const { CalendarService } = await import('../calendar/service');
      await CalendarService.deleteBookingEvent(booking.user_id, booking.google_event_id);
    }

    // 7. Notifications
    // Email to client
    await sendBookingCancellationEmail({
      booker_name: booking.booker_name,
      booker_email: booking.booker_email,
      provider_name: booking.profiles.full_name,
      event_title: booking.event_types.title,
      start_time: booking.start_time,
      refund_amount: refundAmount,
      initiated_by: initiatedBy
    }).catch(err => console.error('Error sending cancellation email:', err));

    // WhatsApp to provider if Ultra plan
    if (booking.profiles.plan_type === 'ultra' && booking.profiles.phone) {
      await WhatsAppService.sendBookingCancellation(
        booking.profiles.phone,
        booking.booker_name,
        new Date(booking.start_time).toLocaleString()
      ).catch(err => console.error('Error sending WhatsApp cancellation:', err));
    }

    return { success: true, refundAmount, refundPercentage };
  }
}
