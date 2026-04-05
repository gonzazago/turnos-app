import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBooking } from './actions'
import { createClient } from '@/utils/supabase/server'

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Notifications
vi.mock('@/utils/notifications', () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue({ success: true }),
}))

// Mock Supabase server client
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock Supabase JS client (used for admin operations)
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

// Mock PaymentAccountService
vi.mock('@/utils/payment-accounts', () => ({
  PaymentAccountService: {
    getActiveAccountAdmin: vi.fn(),
    refreshTokenIfNeeded: vi.fn(),
  }
}))

describe('createBooking action', () => {
  const mockFormData = new FormData()
  mockFormData.append('profileId', 'user-123')
  mockFormData.append('slug', 'jane-smith')
  mockFormData.append('eventId', 'event-456')
  mockFormData.append('name', 'John Doe')
  mockFormData.append('email', 'john@example.com')
  mockFormData.append('startTime', '2026-03-30T10:00:00Z')
  mockFormData.append('endTime', '2026-03-30T10:30:00Z')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockSupabase = () => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  })

  it('should return error if database constraint fails (concurrent booking)', async () => {
    const mockSupabase = createMockSupabase()
    
    // Mock both clients
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const { createClient: createSupabaseAdmin } = await import('@supabase/supabase-js')
    vi.mocked(createSupabaseAdmin).mockReturnValue(mockSupabase as any)
    
    // profile, eventType, daily check, overlap check, insert
    mockSupabase.single
      .mockResolvedValueOnce({ data: { full_name: 'Jane Smith' }, error: null })
      .mockResolvedValueOnce({ data: { title: '30 Min', requires_deposit: false }, error: null })
    
    mockSupabase.lt.mockResolvedValueOnce({ data: [], error: null })
    mockSupabase.lte.mockResolvedValueOnce({ data: [], error: null })
    
    mockSupabase.single.mockResolvedValueOnce({ 
      data: null, 
      error: { code: '23P01' } 
    })
    
    const result = await createBooking(mockFormData)
    expect(result).toEqual({ error: 'Lo sentimos, este horario ya ha sido reservado. Por favor, selecciona otro.' })
  })

  it('should return success if booking is created successfully', async () => {
    const mockSupabase = createMockSupabase()
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const { createClient: createSupabaseAdmin } = await import('@supabase/supabase-js')
    vi.mocked(createSupabaseAdmin).mockReturnValue(mockSupabase as any)

    mockSupabase.single
      .mockResolvedValueOnce({ data: { full_name: 'Jane Smith' }, error: null })
      .mockResolvedValueOnce({ data: { title: '30 Min', requires_deposit: false }, error: null })
    
    mockSupabase.lt.mockResolvedValueOnce({ data: [], error: null })
    mockSupabase.lte.mockResolvedValueOnce({ data: [], error: null })
    mockSupabase.single.mockResolvedValueOnce({ data: { id: 'booking-123' }, error: null })
    
    const result = await createBooking(mockFormData)
    expect(result).toEqual({ 
      success: true, 
      requiresDeposit: false, 
      bookingId: 'booking-123',
      checkoutUrl: undefined
    })
  })

  it('should return error if the same email has already booked on the same day', async () => {
    const mockSupabase = createMockSupabase()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    mockSupabase.single
      .mockResolvedValueOnce({ data: { full_name: 'Jane Smith' }, error: null })
      .mockResolvedValueOnce({ data: { title: '30 Min' }, error: null })

    mockSupabase.lt.mockResolvedValueOnce({ 
      data: [{ id: 'existing-id' }], 
      error: null 
    })
    
    const result = await createBooking(mockFormData)
    expect(result).toEqual({ error: 'Ya tienes una reserva para este día. Solo se permite una reserva por día.' })
  })

  it('should return requiresDeposit and checkoutUrl if event requires deposit', async () => {
    const mockSupabase = createMockSupabase()
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const { createClient: createSupabaseAdmin } = await import('@supabase/supabase-js')
    vi.mocked(createSupabaseAdmin).mockReturnValue(mockSupabase as any)

    mockSupabase.single
      .mockResolvedValueOnce({ 
        data: { full_name: 'Jane Smith' }, 
        error: null 
      })
      .mockResolvedValueOnce({ 
        data: { title: 'Paid Meeting', requires_deposit: true, total_price: 100, deposit_percentage: 20 }, 
        error: null 
      })
    
    mockSupabase.lt.mockResolvedValueOnce({ data: [], error: null })
    mockSupabase.lte.mockResolvedValueOnce({ data: [], error: null })
    mockSupabase.single.mockResolvedValueOnce({ data: { id: 'booking-paid' }, error: null })
    
    // Mock the PaymentAccountService calls
    const { PaymentAccountService } = await import('@/utils/payment-accounts')
    vi.mocked(PaymentAccountService.getActiveAccountAdmin).mockResolvedValue({
      data: { id: 'mp-acc-123', provider: 'mercadopago', access_token: 'old-token' },
      error: null
    } as any)
    vi.mocked(PaymentAccountService.refreshTokenIfNeeded).mockResolvedValue('valid-token')

    // Mock MP preference creation
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'pref-123', init_point: 'http://checkout.mp' })
    })

    const result = await createBooking(mockFormData)
    expect(result).toEqual({ 
      success: true, 
      requiresDeposit: true, 
      bookingId: 'booking-paid',
      checkoutUrl: 'http://checkout.mp'
    })
  })
})
