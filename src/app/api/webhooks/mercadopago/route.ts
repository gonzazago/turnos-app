import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('data.id') || searchParams.get('id');
  const type = searchParams.get('type');

  // Solo nos interesan las notificaciones de pago
  if (type !== 'payment' || !id) {
    return NextResponse.json({ received: true });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Necesitamos el access_token del profesional para consultar este pago.
    // Mercado Pago envía el user_id (ID de MP del profesional) en el cuerpo o headers.
    // Pero lo más seguro es buscar qué cuenta de pago está asociada a este pago pendiente.
    
    // Primero, buscamos la reserva que tenga este preference_id (o esperaremos a tener el external_reference)
    // En el webhook de MP, lo mejor es obtener los detalles del pago primero.
    
    // Para simplificar, buscaremos el access_token basándonos en el provider_user_id que MP nos manda en la notificación
    const body = await request.json();
    const mpUserId = body.user_id; // ID del vendedor en Mercado Pago

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

    // 2. Consultar el estado del pago en Mercado Pago
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
      },
    });

    const payment = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error('Error fetching payment from MP:', payment);
      return NextResponse.json({ error: 'MP API Error' }, { status: 500 });
    }

    const bookingId = payment.external_reference;
    const status = payment.status; // 'approved', 'pending', 'rejected', etc.

    // 3. Actualizar la reserva en Supabase
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
