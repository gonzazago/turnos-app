import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabase/admin';
import { CalendarService } from '@/services/calendar/service';

export async function POST(request: Request) {
  const resourceId = request.headers.get('x-goog-resource-id');
  const resourceState = request.headers.get('x-goog-resource-state');
  const channelId = request.headers.get('x-goog-channel-id');

  console.log(`Received Google Calendar webhook: ${resourceId}, state: ${resourceState}`);

  // 1. If it's a sync notification (resourceState: sync), just acknowledge
  if (resourceState === 'sync') {
    return new Response('OK', { status: 200 });
  }

  // 2. Find the user associated with this webhook channel
  const supabaseAdmin = getSupabaseAdmin();
  const { data: tokenData, error } = await supabaseAdmin
    .from('google_calendar_tokens')
    .select('user_id')
    .eq('webhook_id', channelId)
    .eq('webhook_resource_id', resourceId)
    .single();

  if (error || !tokenData) {
    console.error('Webhook received for unknown channel:', channelId);
    // Even if not found, return 200 to avoid Google retrying indefinitely
    return new Response('OK', { status: 200 });
  }

  // 3. Trigger background sync for this user
  console.log('Syncing calendar for user:', tokenData.user_id);
  await CalendarService.syncCalendarEvents(tokenData.user_id);

  return new Response('OK', { status: 200 });
}
