import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOnboardingStatus, completeOnboarding } from './actions';
import { createClient } from '@/utils/supabase/server';

// Mock Next.js cache and navigation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock Supabase server client
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Onboarding Actions', () => {
  const mockUser = { id: 'user-123' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOnboardingStatus', () => {
    it('should return hasCompletedOnboarding from profile', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { has_completed_onboarding: true },
          error: null
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await getOnboardingStatus();

      expect(result).toEqual({ hasCompletedOnboarding: true });
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.select).toHaveBeenCalledWith('has_completed_onboarding');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', mockUser.id);
    });

    it('should return error if not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await getOnboardingStatus();
      expect(result).toEqual({ error: 'No autorizado' });
    });

    it('should return error if database fetch fails', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await getOnboardingStatus();
      expect(result).toEqual({ error: 'No se pudo obtener el estado de onboarding.' });
    });
  });

  describe('completeOnboarding', () => {
    it('should update has_completed_onboarding to true', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await completeOnboarding();
      expect(result).toEqual({ success: true });
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.update).toHaveBeenCalledWith({ has_completed_onboarding: true });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', mockUser.id);
    });

    it('should return error if not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await completeOnboarding();
      expect(result).toEqual({ error: 'No autorizado' });
    });

    it('should return error if update fails', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await completeOnboarding();
      expect(result).toEqual({ error: 'No se pudo actualizar el estado de onboarding.' });
    });
  });
});
