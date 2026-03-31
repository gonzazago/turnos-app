import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateAvailability } from './actions';
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

describe('updateAvailability action', () => {
  const mockUser = { id: 'user-123' };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully update availability', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const availabilityData = [
      { day_of_week: 1, start_time: '09:00', end_time: '17:00' },
      { day_of_week: 2, start_time: '09:00', end_time: '17:00' },
    ];

    const result = await updateAvailability(availabilityData);
    
    expect(result).toEqual({ success: true });
    expect(mockSupabase.delete).toHaveBeenCalled();
    expect(mockSupabase.insert).toHaveBeenCalled();
  });

  it('should return error if not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    await updateAvailability([]);
    const { redirect } = await import('next/navigation');
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('should return error if delete fails', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
    };
    
    // Make delete fail
    mockSupabase.eq.mockReturnValue({ error: { message: 'Delete failed' } });

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const result = await updateAvailability([]);
    expect(result).toEqual({ error: 'No se pudo actualizar la disponibilidad.' });
  });

  it('should return error if insert fails', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: { message: 'Insert failed' } }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const result = await updateAvailability([{ day_of_week: 1, start_time: '09:00', end_time: '17:00' }]);
    expect(result).toEqual({ error: 'No se pudo actualizar la disponibilidad.' });
  });
});
