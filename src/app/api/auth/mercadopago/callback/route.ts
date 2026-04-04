import {NextResponse} from 'next/server';
import {createClient} from '@/utils/supabase/server';
import {PaymentAccountService} from '@/utils/payment-accounts';

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state'); // User ID passed from settings

    if (error || !code) {
        console.error('OAuth error or missing code:', error);
        return NextResponse.redirect(new URL('/dashboard/settings?error=mp_auth_failed', request.url));
    }

    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    // Use state as fallback if session is lost during redirect
    const userId = user?.id || state;

    if (!userId) {
        console.error('No user session and no state parameter found');
        return NextResponse.redirect(new URL('/dashboard/settings?error=unauthorized', request.url));
    }

    try {
        // Construct redirect URI exactly as it should be in MP Panel
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
        const redirectUri = `${baseUrl}/api/auth/mercadopago/callback`;
        
        const payload = {
            client_secret: process.env.MP_CLIENT_SECRET || '',
            client_id: process.env.MP_CLIENT_ID || '',
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
        };

        console.log('Exchanging code for token. URI:', redirectUri);

        // Exchange the authorization code for an access token
        const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            body: new URLSearchParams(payload),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Mercado Pago token exchange failed. Status:', tokenResponse.status, 'Body:', tokenData);
            return NextResponse.redirect(new URL('/dashboard/settings?error=mp_exchange_failed', request.url));
        }

        const {access_token, refresh_token, expires_in, user_id: mp_user_id} = tokenData;

        // Calculate absolute expiration time
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

        // Save credentials to the new payment_accounts table using admin client
        const { data: dbData, error: dbError } = await PaymentAccountService.saveAccountAdmin({
            user_id: userId,
            provider: 'mercadopago',
            provider_user_id: String(mp_user_id),
            access_token: access_token,
            refresh_token: refresh_token,
            expires_at: expiresAt.toISOString(),
            is_active: true,
        });

        if (dbError) {
            console.error('Database error saving MP account:', dbError);
            return NextResponse.redirect(new URL('/dashboard/settings?error=mp_db_save_failed', request.url));
        }

        console.log('Successfully saved MP account to DB:', dbData.id);

        return NextResponse.redirect(new URL('/dashboard/settings?success=mp_connected', request.url));

    } catch (err) {
        console.error('Unexpected error during MP OAuth:', err);
        return NextResponse.redirect(new URL('/dashboard/settings?error=mp_internal_error', request.url));
    }
}
