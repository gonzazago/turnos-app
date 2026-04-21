import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEventType } from './actions';
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

describe('createEventType action', () => {
  const mockUser = { id: 'user-123' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully create event type with deposit settings', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
        .mockResolvedValueOnce({ data: { plan_type: 'pro' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'event-123' }, error: null }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const formData = new FormData();
    formData.append('title', 'New Event');
    formData.append('duration_mins', '30');
    formData.append('description', 'Description');
    formData.append('requiresDeposit', 'on');
    formData.append('totalPrice', '100');
    formData.append('depositPercentage', '20');

    const result = await createEventType(formData, []);

    expect(result).toEqual({ success: true });
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      requires_deposit: true,
      total_price: 100,
      deposit_percentage: 20,
    }));
  });
});
