import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cancelBooking } from './actions';
import { createClient } from '@/utils/supabase/server';
import { CancellationService } from '@/services/booking/cancellation';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/services/booking/cancellation', () => ({
  CancellationService: {
    processCancellation: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('dashboard actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cancelBooking', () => {
    it('should return error if not authorized', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) }
      } as any);

      const result = await cancelBooking('booking-123');
      expect(result).toEqual({ error: 'No autorizado' });
    });

    it('should call CancellationService and return success', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) }
      } as any);

      vi.mocked(CancellationService.processCancellation).mockResolvedValue({ success: true } as any);

      const result = await cancelBooking('booking-123');
      expect(result.success).toBe(true);
      expect(CancellationService.processCancellation).toHaveBeenCalledWith('booking-123', 'provider');
    });
  });
});
