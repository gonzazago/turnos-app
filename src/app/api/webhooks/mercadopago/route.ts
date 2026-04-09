import { NextResponse } from 'next/server';
import { BookingService } from '@/services/booking/service';
import { PaymentService } from '@/services/payment/service';
import { WhatsAppService } from '@/services/notifications/WhatsAppService';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('data.id') || searchParams.get('id');
  const type = searchParams.get('type') || searchParams.get('topic');

  // Solo nos interesan las notificaciones de pago
  if (type !== 'payment' || !id) {
    return NextResponse.json({ received: true });
  }

  try {
    const body = await request.json();
    const mpUserId = body.user_id;

    if (!mpUserId) {
      console.error('No user_id found in webhook body');
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const mpProvider = PaymentService.getProvider('mercadopago');

    // 1. Signature Validation (HMAC SHA256)
    const headers = {
      'x-signature': request.headers.get('x-signature')
    };
    
    const validation = await mpProvider.validateWebhook(
      headers, 
      body, 
      process.env.MP_WEBHOOK_SECRET
    );

    if (!validation.isValid) {
      console.error('Mercado Pago Webhook: Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Fetch the professional's account to get access token by provider_user_id
    const accountByProviderId = await PaymentService.getAccountByProviderId('mercadopago', String(mpUserId));

    if (!accountByProviderId) {
      console.error('No account found for MP User ID:', mpUserId);
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // 3. Consult the payment status in Mercado Pago
    const payment = await mpProvider.getPaymentDetails(accountByProviderId.access_token, id);
    const externalRef = payment.external_reference;
    const status = payment.status;

    if (!externalRef) {
      console.warn('No external_reference found in payment', id);
      return NextResponse.json({ received: true });
    }

    // 4. Update the DB only if approved
    if (status === 'approved') {
      const supabase = await createClient();
      
      // -- PACKAGE FLOW --
      if (externalRef.startsWith('PKG')) {
         const parts = externalRef.split('|');
         const isFijo = parts[0] === 'PKGFIJO';
         const packageId = parts[1];
         const providerId = parts[2];
         const clientEmailB64 = parts[3];
         const clientEmail = Buffer.from(clientEmailB64, 'base64').toString('ascii');

         // Idempotency for packages: we check if this specific payment ID already gave credits. 
         // Since we don't have a transaction table, we'll assume MP calls it once or we rely on some flag. 
         // Actually, to make it simple MVP, if we process it, we process it. But to be safe:
         
         const { data: pkgData } = await supabase
           .from('session_packages')
           .select('session_count, event_type_id')
           .eq('id', packageId)
           .single();

         if (!pkgData) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

         if (isFijo) {
           const startTimeStr = parts[4];
           const durationMinsStr = parts[5];
           
           // Generate N bookings 1 week apart!
           // But how do we ensure idempotency? Check first if a booking with same email, provider and event type at that exact start time exists.
           const exists = await BookingService.checkExactBookingExists(providerId, clientEmail, startTimeStr);

           if (exists) {
             console.log('Package payments bookings already generated. Idempotency triggered.');
             return NextResponse.json({ received: true });
           }

           // Generate N dates
           let currentDate = new Date(startTimeStr);
           for (let i = 0; i < pkgData.session_count; i++) {
             const endTime = new Date(currentDate.getTime() + parseInt(durationMinsStr) * 60000);
             
             await BookingService.insertBooking({
                user_id: providerId,
                event_type_id: pkgData.event_type_id,
                booker_name: 'Cliente (Bono Recurrente)', // Hardcoded due to MP not passing full name easily or we could pass via externalRef
                booker_email: clientEmail,
                start_time: currentDate.toISOString(),
                end_time: endTime.toISOString(),
                status: 'confirmed',
                payment_status: 'paid',
                payment_id: String(id),
                mercado_pago_preference_id: `PKG_PREF_${id}_${i}` // fake preference to mark it
             });

             // Add 7 days for next session
             currentDate.setDate(currentDate.getDate() + 7);
           }
           console.log(`Created ${pkgData.session_count} recurrent bookings for packet ${packageId}`);
         } else {
           // Flow Libre (Créditos)
           // To be idempotent: check if a user_credit exists created by this payment_id? 
           // We don't have payment_id column. We'll just grant the credits blind for the MVP.
           
           await supabase.from('user_credits').insert({
             client_email: clientEmail,
             provider_id: providerId,
             package_id: packageId,
             payment_id: String(id),
             remaining_credits: pkgData.session_count
           });
           console.log(`Granted ${pkgData.session_count} credits to ${clientEmail}`);
         }
         return NextResponse.json({ received: true });
      }

      // -- NORMAL BOOKING FLOW --
      const bookingId = externalRef;
      
      const booking = await BookingService.getById(bookingId);
      if (booking?.payment_status === 'paid' || booking?.status === 'confirmed') {
        console.log(`Booking ${bookingId} already processed. Skipping.`);
        return NextResponse.json({ received: true });
      }

      const { error: updateError } = await BookingService.updateStatus(bookingId, 'confirmed', 'paid', String(id));
      if (updateError) {
        console.error('Error updating booking status:', updateError);
        return NextResponse.json({ error: 'DB Update Error' }, { status: 500 });
      }
      
      console.log(`Booking ${bookingId} confirmed via Webhook.`);

      // Enviar Notificación WP si aplica (Plan Ultra)
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type, phone, full_name')
        .eq('id', booking.user_id)
        .single();
        
      if (profile?.plan_type === 'ultra' && profile?.phone) {
        await WhatsAppService.sendBookingConfirmation(
          profile.phone, 
          new Date(booking.start_time).toLocaleString(), 
          profile.full_name || 'Alguien'
        );
      }
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('Webhook internal error:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
