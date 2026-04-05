'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { areIntervalsOverlapping } from 'date-fns'
import { sendBookingConfirmation } from '@/utils/notifications'
import { PaymentAccountService } from '@/utils/payment-accounts'

export async function createBooking(formData: FormData) {
  const supabase = await createClient()

  const profileId = formData.get('profileId') as string
  const slug = formData.get('slug') as string
  const eventId = formData.get('eventId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string

  // Fetch profile and event type info for notifications
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

  // NEW: Daily booking rate limit check (one booking per day per email)
  const startTimeDate = new Date(startTime)
  const bookingDate = new Date(startTimeDate.getFullYear(), startTimeDate.getMonth(), startTimeDate.getDate()).toISOString()
  const nextDay = new Date(startTimeDate.getFullYear(), startTimeDate.getMonth(), startTimeDate.getDate() + 1).toISOString()

  const { data: dailyBookings } = await supabase
    .from('bookings')
    .select('id')
    .eq('user_id', profileId)
    .eq('booker_email', email)
    .gte('start_time', bookingDate)
    .lt('start_time', nextDay)

  if (dailyBookings && dailyBookings.length > 0) {
    return { error: 'Ya tienes una reserva para este día. Solo se permite una reserva por día.' }
  }

  // Simple availability check: verify no overlapping bookings
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('user_id', profileId)
    .gte('end_time', startTime)
    .lte('start_time', endTime)

  if (existingBookings && existingBookings.length > 0) {
    const isOverlapping = existingBookings.some((booking) => 
      areIntervalsOverlapping(
        { start: new Date(startTime), end: new Date(endTime) },
        { start: new Date(booking.start_time), end: new Date(booking.end_time) }
      )
    )

    if (isOverlapping) {
      return { error: 'Lo sentimos, este horario ya ha sido reservado. Por favor, selecciona otro.' }
    }
  }

  // Use Admin client to create the booking to bypass RLS and get the ID back
  const { createClient: createSupabaseAdmin } = await import('@supabase/supabase-js')
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: newBooking, error } = await supabaseAdmin
    .from('bookings')
    .insert({
      user_id: profileId,
      event_type_id: eventId,
      booker_name: name,
      booker_email: email,
      start_time: startTime,
      end_time: endTime,
      status: eventType?.requires_deposit ? 'pending_payment' : 'confirmed',
      payment_status: eventType?.requires_deposit ? 'pending' : 'paid'
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    // Handle PostgreSQL exclusion constraint violation (23P01)
    if (error.code === '23P01') {
      return { error: 'Lo sentimos, este horario ya ha sido reservado. Por favor, selecciona otro.' }
    }
    return { error: 'Ocurrió un error al procesar tu reserva. Intenta nuevamente.' }
  }

  let checkoutUrl: string | undefined

  // NEW: Mercado Pago Integration - Create Preference if deposit is required
  if (eventType?.requires_deposit && newBooking) {
    try {
      // 1. Get owner's Mercado Pago account (using Admin client because of RLS)
      const { data: mpAccount } = await PaymentAccountService.getActiveAccountAdmin(profileId, 'mercadopago');
      
      if (!mpAccount) {
        throw new Error('Owner has no connected Mercado Pago account');
      }

      // 2. Refresh token if needed
      const accessToken = await PaymentAccountService.refreshTokenIfNeeded(mpAccount.id);

      // 3. Calculate deposit amount
      const depositAmount = (Number(eventType.total_price) * Number(eventType.deposit_percentage)) / 100;
      
      const preferencePayload = {
        items: [
          {
            id: eventId,
            title: `Seña para: ${eventType.title}`,
            description: `Reserva con ${profile?.full_name || 'el profesional'} para el día ${startTime}`,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: depositAmount,
          },
        ],
        payer: {
          name: name,
          email: email,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/${eventId}/status?status=success&bookingId=${newBooking.id}`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/${eventId}/status?status=failure&bookingId=${newBooking.id}`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/${eventId}/status?status=pending&bookingId=${newBooking.id}`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
        external_reference: newBooking.id,
        statement_descriptor: 'TURNOS APP',
      };

      // 4. Create Preference in Mercado Pago
      const prefResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencePayload),
      });

      const prefData = await prefResponse.json();

      if (!prefResponse.ok) {
        console.error('Mercado Pago Preference Error. Status:', prefResponse.status, 'Body:', prefData);
        throw new Error('Error creating payment link');
      }

      console.log('MP Preference created successfully:', prefData.id);
      checkoutUrl = prefData.init_point;

      // 5. Update booking with preference ID
      await supabaseAdmin
        .from('bookings')
        .update({ mercado_pago_preference_id: prefData.id })
        .eq('id', newBooking.id);

    } catch (mpError) {
      console.error('Mercado Pago integration error:', mpError);
      return { error: 'No se pudo generar el link de pago. Intenta nuevamente.' };
    }
  }

  // Send confirmation emails (only if not pending payment)
  if (profile && eventType && !eventType.requires_deposit) {
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
    requiresDeposit: eventType?.requires_deposit || false,
    bookingId: newBooking?.id,
    checkoutUrl: checkoutUrl
  }
}
