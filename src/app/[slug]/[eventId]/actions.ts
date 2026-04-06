'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendBookingConfirmation } from '@/utils/notifications'
import { BookingService } from '@/services/booking/service'
import { PaymentService } from '@/services/payment/service'

export async function createBooking(formData: FormData) {
  const supabase = await createClient()

  const profileId = formData.get('profileId') as string
  const slug = formData.get('slug') as string
  const eventId = formData.get('eventId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string

  try {
    // 1. Fetch profile and event type info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, contact_email')
      .eq('id', profileId)
      .single()

    const { data: eventType } = await supabase
      .from('event_types')
      .select('title, requires_deposit, total_price, deposit_percentage')
      .eq('id', eventId)
      .single()

    if (!profile || !eventType) {
      return { error: 'No se encontró la información necesaria para crear la reserva.' }
    }

    // 2. Delegate booking creation to the Service
    const newBooking = await BookingService.create({
      profileId,
      eventTypeId: eventId,
      bookerName: name,
      bookerEmail: email,
      startTime,
      endTime,
      requiresDeposit: eventType.requires_deposit
    })

    let checkoutUrl: string | undefined

    // 3. Handle Payment if required
    if (eventType.requires_deposit && newBooking) {
      try {
        const accessToken = await PaymentService.getValidAccessToken(profileId, 'mercadopago');
        const depositAmount = (Number(eventType.total_price) * Number(eventType.deposit_percentage)) / 100;
        const mpProvider = PaymentService.getProvider('mercadopago');

        const preference = await mpProvider.createPreference(
          accessToken,
          [{
            id: eventId,
            title: `Seña para: ${eventType.title}`,
            description: `Reserva con ${profile.full_name || 'el profesional'} para el día ${startTime}`,
            quantity: 1,
            unit_price: depositAmount,
          }],
          { name: name, email: email },
          {
            external_reference: newBooking.id,
            back_urls: {
              success: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/${eventId}/status?status=success&bookingId=${newBooking.id}`,
              failure: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/${eventId}/status?status=failure&bookingId=${newBooking.id}`,
              pending: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/${eventId}/status?status=pending&bookingId=${newBooking.id}`,
            },
            notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
          }
        );

        checkoutUrl = preference.init_point;
        await BookingService.updatePreferenceId(newBooking.id, preference.id);

      } catch (mpError) {
        console.error('Payment integration error:', mpError);
        return { error: 'No se pudo generar el link de pago. Intenta nuevamente.' };
      }
    }

    // 4. Send confirmation emails (only if not pending payment)
    if (!eventType.requires_deposit) {
      sendBookingConfirmation({
        booker_name: name,
        booker_email: email,
        provider_name: profile.full_name || 'El Proveedor',
        provider_email: profile.contact_email || 'no-reply@ejemplo.com',
        event_title: eventType.title,
        start_time: startTime
      }).catch(err => console.error('Error sending confirmation email:', err))
    }

    revalidatePath('/dashboard')
    return { 
      success: true, 
      requiresDeposit: eventType.requires_deposit,
      bookingId: newBooking.id,
      checkoutUrl: checkoutUrl
    }

  } catch (error: any) {
    console.error('Booking error:', error);
    return { error: error.message || 'Ocurrió un error inesperado al procesar tu reserva.' };
  }
}
