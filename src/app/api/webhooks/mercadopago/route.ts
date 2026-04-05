import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('data.id') || searchParams.get('id');
  const type = searchParams.get('type') || searchParams.get('topic');

  // Solo nos interesan las notificaciones de pago
  if (type !== 'payment' || !id) {
    return NextResponse.json({ received: true });
  }

  // 1. Signature Validation (HMAC SHA256)
  const signatureHeader = request.headers.get('x-signature');
  const secret = process.env.MP_WEBHOOK_SECRET;

  if (secret && signatureHeader) {
    const parts = signatureHeader.split(',');
    const tsPart = parts.find(p => p.trim().startsWith('ts='));
    const v1Part = parts.find(p => p.trim().startsWith('v1='));

    if (tsPart && v1Part) {
      const ts = tsPart.split('=')[1];
      const v1 = v1Part.split('=')[1];
      
      // Manifest format for signature validation
      const manifest = `id:${id};topic:${type};ts:${ts};`;
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(manifest);
      const hash = hmac.digest('hex');

      if (hash !== v1) {
        console.error('Mercado Pago Webhook: Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
  } else if (!secret) {
    console.warn('MP_WEBHOOK_SECRET is not defined. Skipping signature validation.');
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json();
    const mpUserId = body.user_id;

    if (!mpUserId) {
      console.error('No user_id found in webhook body');
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // 2. Fetch the professional's access_token
    const { data: account } = await supabaseAdmin
      .from('payment_accounts')
      .select('access_token')
      .eq('provider_user_id', String(mpUserId))
      .eq('provider', 'mercadopago')
      .single();

    if (!account) {
      console.error('No account found for MP User ID:', mpUserId);
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // 3. Consult the payment status in Mercado Pago
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
      },
    });

    if (!paymentResponse.ok) {
      const errData = await paymentResponse.json();
      console.error('Error fetching payment from MP:', errData);
      return NextResponse.json({ error: 'MP API Error' }, { status: 500 });
    }

    const payment = await paymentResponse.json();
    const bookingId = payment.external_reference;
    const status = payment.status;

    if (!bookingId) {
      console.warn('No external_reference (bookingId) found in payment', id);
      return NextResponse.json({ received: true });
    }

    // 4. Idempotency Check: Verify if the booking is already paid
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('status, payment_status')
      .eq('id', bookingId)
      .single();

    if (booking?.payment_status === 'paid' || booking?.status === 'confirmed') {
      console.log(`Booking ${bookingId} already processed. Skipping.`);
      return NextResponse.json({ received: true });
    }

    // 5. Update the booking status if approved
    if (status === 'approved') {
      const { error: updateError } = await supabaseAdmin
        .from('bookings')
        .update({ 
          status: 'confirmed', 
          payment_status: 'paid' 
        })
        .eq('id', bookingId);

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
