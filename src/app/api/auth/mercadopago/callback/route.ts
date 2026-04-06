import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { PaymentService } from '@/services/payment/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('mp_oauth_state')?.value;

  // 1. Validate CSRF state
  if (!state || !storedState || state !== storedState) {
    console.error('CSRF Validation failed: state mismatch or missing');
    return NextResponse.redirect(new URL('/dashboard/settings?error=mp_auth_failed', request.url));
  }

  // Clear the state cookie after use
  cookieStore.delete('mp_oauth_state');

  if (error || !code) {
    console.error('OAuth error or missing code:', error);
    return NextResponse.redirect(new URL('/dashboard/settings?error=mp_auth_failed', request.url));
  }

  // 2. Get the authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('No authenticated user found during OAuth callback');
    return NextResponse.redirect(new URL('/dashboard/settings?error=unauthorized', request.url));
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    const redirectUri = `${baseUrl}/api/auth/mercadopago/callback`;
    
    const mpProvider = PaymentService.getProvider('mercadopago');

    // 3. Exchange code for token
    const result = await mpProvider.exchangeAuthorizationCode(code, redirectUri);

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + result.expires_in);

    // 4. Save account using service
    const { error: dbError } = await PaymentService.saveAccount({
      user_id: user.id,
      provider: 'mercadopago',
      provider_user_id: result.provider_user_id,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_at: expiresAt.toISOString(),
      is_active: true,
    });

    if (dbError) {
      console.error('Database error saving MP account:', dbError);
      return NextResponse.redirect(new URL('/dashboard/settings?error=mp_db_save_failed', request.url));
    }

    return NextResponse.redirect(new URL('/dashboard/settings?success=mp_connected', request.url));

  } catch (err) {
    console.error('Unexpected error during MP OAuth:', err);
    return NextResponse.redirect(new URL('/dashboard/settings?error=mp_internal_error', request.url));
  }
}
