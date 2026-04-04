import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentAccountService } from './payment-accounts';
import { createClient } from '@/utils/supabase/server';

// Mock Supabase server client
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('PaymentAccountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveAccount', () => {
    it('should insert or update a payment account', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'account-123' }, error: null }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const accountData = {
        user_id: 'user-1',
        provider: 'mercadopago',
        provider_user_id: 'mp-user-1',
        access_token: 'access-123',
        refresh_token: 'refresh-123',
        expires_at: '2026-04-01T12:00:00Z',
      };

      const result = await PaymentAccountService.saveAccount(accountData);

      expect(result.data?.id).toBe('account-123');
      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          provider: 'mercadopago',
          access_token: 'access-123',
        }),
        { onConflict: 'provider, provider_user_id' }
      );
    });
  });

  describe('getActiveAccount', () => {
    it('should fetch the active account for a user and provider', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'account-123', access_token: 'token-123' },
          error: null,
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await PaymentAccountService.getActiveAccount('user-1', 'mercadopago');

      expect(result.data?.id).toBe('account-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('provider', 'mercadopago');
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
    });
  });
});
