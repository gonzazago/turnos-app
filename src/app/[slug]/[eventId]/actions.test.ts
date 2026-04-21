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

// Mock Supabase admin singleton
vi.mock('@/utils/supabase/admin', () => ({
  getSupabaseAdmin: vi.fn(),
}))

// Mock Services
vi.mock('@/services/booking/service', () => ({
  BookingService: {
    create: vi.fn(),
    updatePreferenceId: vi.fn(),
    getActiveBookingByEmail: vi.fn(),
    getById: vi.fn(),
    reschedule: vi.fn(),
    updateStatus: vi.fn(),
  }
}))

vi.mock('@/services/payment/service', () => ({
  PaymentService: {
    getProvider: vi.fn(),
    getValidAccessToken: vi.fn(),
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
    maybeSingle: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  })

  it('should return error if database fetch fails for profile/eventType', async () => {
    const mockSupabase = createMockSupabase()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })
    
    const result = await createBooking(mockFormData)
    expect(result).toEqual({ error: 'No se encontró la información necesaria para crear la reserva.' })
  })

  it('should return success if booking is created successfully without deposit', async () => {
    const mockSupabase = createMockSupabase()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    mockSupabase.single
      .mockResolvedValueOnce({ data: { full_name: 'Jane Smith', contact_email: 'jane@example.com' }, error: null })
      .mockResolvedValueOnce({ data: { title: '30 Min', requires_deposit: false }, error: null })
    
    // Mock user_credits check
    mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null })

    const { BookingService } = await import('@/services/booking/service')
    vi.mocked(BookingService.create).mockResolvedValue({ id: 'booking-123', cancel_token: 'token-123' } as any)
    
    const result = await createBooking(mockFormData)
    expect(result).toEqual({ 
      success: true, 
      requiresDeposit: false, 
      bookingId: 'booking-123',
      checkoutUrl: undefined
    })
  })

  it('should return error if BookingService throws', async () => {
    const mockSupabase = createMockSupabase()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    mockSupabase.single
      .mockResolvedValueOnce({ data: { full_name: 'Jane Smith' }, error: null })
      .mockResolvedValueOnce({ data: { title: '30 Min' }, error: null })

    // Mock user_credits check
    mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null })

    const { BookingService } = await import('@/services/booking/service')
    vi.mocked(BookingService.create).mockRejectedValue(new Error('Rate limit exceeded'))
    
    const result = await createBooking(mockFormData)
    expect(result).toEqual({ error: 'Rate limit exceeded' })
  })

  it('should return checkoutUrl if event requires deposit', async () => {
    const mockSupabase = createMockSupabase()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    mockSupabase.single
      .mockResolvedValueOnce({ data: { full_name: 'Jane Smith', plan_type: 'pro' }, error: null })
      .mockResolvedValueOnce({ 
        data: { title: 'Paid Meeting', requires_deposit: true, total_price: 100, deposit_percentage: 20 }, 
        error: null 
      })
    
    // Mock user_credits check
    mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null })

    const { BookingService } = await import('@/services/booking/service')
    vi.mocked(BookingService.create).mockResolvedValue({ id: 'booking-paid', cancel_token: 'token-paid' } as any)
    
    const { PaymentService } = await import('@/services/payment/service')
    vi.mocked(PaymentService.getValidAccessToken).mockResolvedValue('valid-token')
    
    const mockProvider = {
      createPreference: vi.fn().mockResolvedValue({ id: 'pref-123', init_point: 'http://checkout.mp' })
    }
    vi.mocked(PaymentService.getProvider).mockReturnValue(mockProvider as any)

    const result = await createBooking(mockFormData)
    expect(result).toEqual({ 
      success: true, 
      requiresDeposit: true, 
      bookingId: 'booking-paid',
      checkoutUrl: 'http://checkout.mp'
    })
    
    expect(BookingService.updatePreferenceId).toHaveBeenCalledWith('booking-paid', 'pref-123')
  })
})
