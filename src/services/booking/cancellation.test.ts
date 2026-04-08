import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CancellationService } from './cancellation';
import { getSupabaseAdmin } from '@/utils/supabase/admin';
import { PaymentService } from '../payment/service';
import { CalendarService } from '../calendar/service';

vi.mock('@/utils/supabase/admin', () => ({
  getSupabaseAdmin: vi.fn(),
}));

vi.mock('../payment/service', () => ({
  PaymentService: {
    getValidAccessToken: vi.fn(),
    getProvider: vi.fn(),
  },
}));

vi.mock('../calendar/service', () => ({
  CalendarService: {
    deleteBookingEvent: vi.fn(),
  },
}));

vi.mock('@/utils/notifications', () => ({
  sendBookingCancellationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../notifications/WhatsAppService', () => ({
  WhatsAppService: {
    sendBookingCancellation: vi.fn().mockResolvedValue(true),
  },
}));

describe('CancellationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBooking = {
    id: 'booking-123',
    user_id: 'provider-123',
    status: 'confirmed',
    payment_status: 'paid',
    payment_id: 'pay-123',
    cancel_token: 'token-123',
    start_time: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours from now
    booker_name: 'John Client',
    booker_email: 'john@client.com',
    event_types: {
      title: '30 Min',
      total_price: 100,
      deposit_percentage: 20,
      requires_deposit: true
    },
    profiles: {
      id: 'provider-123',
      full_name: 'Jane Pro',
      plan_type: 'ultra',
      phone: '123456',
      refund_rules: [
        { hoursBefore: 24, percentage: 50 },
        { hoursBefore: 48, percentage: 100 }
      ]
    }
  };

  it('should process client cancellation with partial refund', async () => {
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { ...mockBooking, start_time: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString() }, error: null }),
      update: vi.fn().mockReturnThis(),
    };

    vi.mocked(getSupabaseAdmin).mockReturnValue({ from: vi.fn(() => mockFrom) } as any);
    
    const mockMP = { refundPayment: vi.fn().mockResolvedValue({ id: 'ref-123' }) };
    vi.mocked(PaymentService.getProvider).mockReturnValue(mockMP as any);
    vi.mocked(PaymentService.getValidAccessToken).mockResolvedValue('token');

    const result = await CancellationService.processCancellation('booking-123', 'client', 'token-123');

    expect(result.success).toBe(true);
    expect(result.refundPercentage).toBe(50);
    expect(result.refundAmount).toBe(10); // 50% of $20 deposit
    expect(mockMP.refundPayment).toHaveBeenCalledWith('token', 'pay-123', 10);
  });

  it('should process provider cancellation with 100% refund', async () => {
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockBooking, error: null }),
      update: vi.fn().mockReturnThis(),
    };

    vi.mocked(getSupabaseAdmin).mockReturnValue({ from: vi.fn(() => mockFrom) } as any);
    
    const mockMP = { refundPayment: vi.fn().mockResolvedValue({ id: 'ref-123' }) };
    vi.mocked(PaymentService.getProvider).mockReturnValue(mockMP as any);

    const result = await CancellationService.processCancellation('booking-123', 'provider');

    expect(result.success).toBe(true);
    expect(result.refundPercentage).toBe(100);
    expect(result.refundAmount).toBe(20);
  });
});
