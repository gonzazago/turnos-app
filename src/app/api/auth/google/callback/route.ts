import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { GoogleCalendarService } from '@/services/calendar/google';
import { CalendarService } from '@/services/calendar/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('google_oauth_state')?.value;

  if (!state || !storedState || state !== storedState) {
    console.error('CSRF Validation failed: state mismatch or missing');
    return NextResponse.redirect(new URL('/dashboard/settings?error=google_auth_failed', request.url));
  }

  cookieStore.delete('google_oauth_state');

  if (error || !code) {
    console.error('OAuth error or missing code:', error);
    return NextResponse.redirect(new URL('/dashboard/settings?error=google_auth_failed', request.url));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=unauthorized', request.url));
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    
    const googleService = new GoogleCalendarService();
    const result = await googleService.exchangeAuthorizationCode(code, redirectUri);

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + result.expires_in);

    // Save tokens to database
    const { error: dbError } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        user_id: user.id,
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'user_id' });

    if (dbError) {
      console.error('Database error saving Google tokens:', dbError);
      return NextResponse.redirect(new URL('/dashboard/settings?error=google_db_save_failed', request.url));
    }

    // Mark as connected in profile
    await supabase
      .from('profiles')
      .update({ google_calendar_connected: true })
      .eq('id', user.id);

    // 5. Setup Webhook
    await CalendarService.setupWebhook(user.id);

    return NextResponse.redirect(new URL('/dashboard/settings?success=google_connected', request.url));

  } catch (err) {
    console.error('Unexpected error during Google OAuth:', err);
    return NextResponse.redirect(new URL('/dashboard/settings?error=google_internal_error', request.url));
  }
}
