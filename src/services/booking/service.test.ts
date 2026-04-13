import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingService } from './service';
import { CalendarService } from '../calendar/service';
import { getSupabaseAdmin } from '@/utils/supabase/admin';

vi.mock('@/utils/supabase/admin', () => ({
  getSupabaseAdmin: vi.fn(),
}));

vi.mock('../calendar/service', () => ({
  CalendarService: {
    createBookingEvent: vi.fn(),
    deleteBookingEvent: vi.fn(),
    updateBookingEvent: vi.fn(),
  },
}));

describe('BookingService Synchronization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call CalendarService when a booking is created', async () => {
    const params = {
      profileId: 'user_123',
      eventTypeId: 'event_123',
      bookerName: 'Test Booker',
      bookerEmail: 'booker@example.com',
      startTime: '2026-04-06T10:00:00Z',
      endTime: '2026-04-06T11:00:00Z',
      requiresDeposit: false,
    };

    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'booking_123' }, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null }),
    };

    vi.mocked(getSupabaseAdmin).mockReturnValue({ from: vi.fn(() => mockFrom) } as any);
    vi.mocked(CalendarService.createBookingEvent).mockResolvedValue({ id: 'google_event_123' });

    await BookingService.create(params);

    expect(CalendarService.createBookingEvent).toHaveBeenCalled();
  });

  it('should call CalendarService.deleteBookingEvent when a booking is cancelled', async () => {
    const bookingId = 'booking_123';
    const userId = 'user_123';
    
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { google_event_id: 'google_event_123' }, error: null }),
      delete: vi.fn().mockReturnThis(),
      then: (resolve: any) => resolve({ data: null, error: null }),
    };

    vi.mocked(getSupabaseAdmin).mockReturnValue({ from: vi.fn(() => mockFrom) } as any);
    vi.mocked(CalendarService.deleteBookingEvent).mockResolvedValue(true);

    await BookingService.cancel(bookingId, userId);

    expect(CalendarService.deleteBookingEvent).toHaveBeenCalledWith(userId, 'google_event_123');
  });

  describe('getUpcomingBookingsForReminders', () => {
    it('should fetch upcoming confirmed bookings with their related profile data', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: (resolve: any) => resolve({
          data: [
            { id: '1', start_time: '2026-04-10T10:00:00Z', profiles: { phone: '123', plan_type: 'ultra', full_name: 'Dr. House' } }
          ],
          error: null
        }),
      };
      vi.mocked(getSupabaseAdmin).mockReturnValue({ from: vi.fn(() => mockFrom) } as any);

      const startDate = '2026-04-10T00:00:00Z';
      const endDate = '2026-04-10T23:59:59Z';

      const result = await BookingService.getUpcomingBookingsForReminders(startDate, endDate);

      expect(getSupabaseAdmin().from).toHaveBeenCalledWith('bookings');
      expect(mockFrom.select).toHaveBeenCalledWith('id, start_time, booker_name, user_id, profiles!inner(phone, plan_type, full_name)');
      expect(mockFrom.eq).toHaveBeenCalledWith('status', 'confirmed');
      expect(mockFrom.gte).toHaveBeenCalledWith('start_time', startDate);
      expect(mockFrom.lte).toHaveBeenCalledWith('start_time', endDate);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('getConfirmedBookingsWithGoogleId', () => {
    it('should fetch confirmed bookings that have a google_event_id for a user', async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        then: (resolve: any) => resolve({
          data: [{ id: '1', google_event_id: 'google-1' }],
          error: null
        }),
      };
      vi.mocked(getSupabaseAdmin).mockReturnValue({ from: vi.fn(() => mockFrom) } as any);

      const result = await BookingService.getConfirmedBookingsWithGoogleId('user_123');

      expect(getSupabaseAdmin().from).toHaveBeenCalledWith('bookings');
      expect(mockFrom.select).toHaveBeenCalledWith('id, google_event_id');
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user_123');
      expect(mockFrom.not).toHaveBeenCalledWith('google_event_id', 'is', null);
      expect(mockFrom.eq).toHaveBeenCalledWith('status', 'confirmed');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('reschedule', () => {
    it('should update booking and call CalendarService.updateBookingEvent', async () => {
      const bookingId = 'booking_123';
      const userId = 'user_123';
      const startTime = '2026-04-10T14:00:00Z';
      const endTime = '2026-04-10T15:00:00Z';

      const mockFrom: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({ 
            data: { id: bookingId, user_id: userId, start_time: '2026-04-10T10:00:00Z', google_event_id: 'google_123', profiles: { reschedule_limit_hours: 24 } }, 
            error: null 
          })
          .mockResolvedValueOnce({
            data: { id: bookingId, start_time: startTime },
            error: null
          }),
        update: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: [], error: null }),
      };

      vi.mocked(getSupabaseAdmin).mockReturnValue({ from: vi.fn(() => mockFrom) } as any);
      vi.mocked(CalendarService.updateBookingEvent).mockResolvedValue(true);

      const result = await BookingService.reschedule(bookingId, userId, startTime, endTime);

      expect(mockFrom.update).toHaveBeenCalledWith({ start_time: startTime, end_time: endTime });
      expect(CalendarService.updateBookingEvent).toHaveBeenCalledWith(userId, 'google_123', {
        start_time: startTime,
        end_time: endTime
      });
      expect(result.id).toBe(bookingId);
    });
  });
});
