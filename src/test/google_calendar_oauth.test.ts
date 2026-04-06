import { describe, it, expect, vi } from 'vitest';
import { GoogleCalendarService } from '@/services/calendar/google';

describe('Google Calendar OAuth Service', () => {
  it('should exchange authorization code for tokens', async () => {
    const mockCode = 'auth_code';
    const mockRedirectUri = 'http://localhost:3000/callback';
    
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        expires_in: 3600
      })
    });

    const service = new GoogleCalendarService();
    const result = await service.exchangeAuthorizationCode(mockCode, mockRedirectUri);
    
    expect(result.access_token).toBe('access_token');
    expect(result.refresh_token).toBe('refresh_token');
    expect(result.expires_in).toBe(3600);
  });
});
