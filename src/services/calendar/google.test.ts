import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleCalendarService } from '@/services/calendar/google';

describe('GoogleCalendarService', () => {
  let service: GoogleCalendarService;
  const mockAccessToken = 'mock_access_token';

  beforeEach(() => {
    service = new GoogleCalendarService();
    global.fetch = vi.fn();
  });

  it('should create an event with Google Meet', async () => {
    const mockEvent = {
      summary: 'Test Event',
      start: { dateTime: '2026-04-06T10:00:00Z', timeZone: 'UTC' },
      end: { dateTime: '2026-04-06T11:00:00Z', timeZone: 'UTC' },
      attendees: [{ email: 'client@example.com' }],
      conferenceData: true
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'event_id_123', hangoutLink: 'http://meet.google.com/abc' })
    });

    const result = await service.createEvent(mockAccessToken, mockEvent);

    expect(result.id).toBe('event_id_123');
    expect(result.hangoutLink).toBe('http://meet.google.com/abc');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('conferenceDataVersion=1'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockAccessToken}`,
          'Content-Type': 'application/json',
        })
      })
    );
  });

  it('should delete an event', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true
    });

    const result = await service.deleteEvent(mockAccessToken, 'event_id_123');

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('event_id_123'),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockAccessToken}`
        })
      })
    );
  });
});
