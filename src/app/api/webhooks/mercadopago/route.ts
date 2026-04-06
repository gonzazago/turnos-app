import { NextResponse } from 'next/server';
import { BookingService } from '@/services/booking/service';
import { PaymentService } from '@/services/payment/service';

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
    const bookingId = payment.external_reference;
    const status = payment.status;

    if (!bookingId) {
      console.warn('No external_reference (bookingId) found in payment', id);
      return NextResponse.json({ received: true });
    }

    // 4. Idempotency Check & Update
    const booking = await BookingService.getById(bookingId);

    if (booking?.payment_status === 'paid' || booking?.status === 'confirmed') {
      console.log(`Booking ${bookingId} already processed. Skipping.`);
      return NextResponse.json({ received: true });
    }

    // 5. Update the booking status if approved
    if (status === 'approved') {
      const { error: updateError } = await BookingService.updateStatus(bookingId, 'confirmed', 'paid');

      if (updateError) {
        console.error('Error updating booking status:', updateError);
        return NextResponse.json({ error: 'DB Update Error' }, { status: 500 });
      }
      
      console.log(`Booking ${bookingId} confirmed via Webhook.`);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('Webhook internal error:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
