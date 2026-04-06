import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/webhooks/google-calendar/route';
import { NextRequest } from 'next/server';

vi.mock('@/utils/supabase/admin', () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { user_id: 'user_123' }, error: null }),
  })),
}));

describe('Google Calendar Webhook', () => {
  it('should process a sync notification', async () => {
    const request = new NextRequest('http://localhost:3000/api/webhooks/google-calendar', {
      method: 'POST',
      headers: {
        'x-goog-resource-id': 'resource_123',
        'x-goog-resource-state': 'exists',
        'x-goog-channel-id': 'channel_123',
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
