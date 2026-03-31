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

describe('createBooking action', () => {
  const mockFormData = new FormData()
  mockFormData.append('profileId', 'user-123')
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
  })

  it('should return error if database constraint fails (concurrent booking)', async () => {
    const mockSupabase = createMockSupabase()
    
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
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await createBooking(mockFormData)
    expect(result).toEqual({ error: 'Lo sentimos, este horario ya ha sido reservado. Por favor, selecciona otro.' })
  })

  it('should return success if booking is created successfully', async () => {
    const mockSupabase = createMockSupabase()

    mockSupabase.single
      .mockResolvedValueOnce({ data: { full_name: 'Jane Smith' }, error: null })
      .mockResolvedValueOnce({ data: { title: '30 Min', requires_deposit: false }, error: null })
    
    mockSupabase.lt.mockResolvedValueOnce({ data: [], error: null })
    mockSupabase.lte.mockResolvedValueOnce({ data: [], error: null })
    mockSupabase.single.mockResolvedValueOnce({ data: { id: 'booking-123' }, error: null })
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await createBooking(mockFormData)
    expect(result).toEqual({ 
      success: true, 
      requiresDeposit: false, 
      mpPublicKey: undefined,
      bookingId: 'booking-123'
    })
  })

  it('should return error if the same email has already booked on the same day', async () => {
    const mockSupabase = createMockSupabase()

    mockSupabase.single
      .mockResolvedValueOnce({ data: { full_name: 'Jane Smith' }, error: null })
      .mockResolvedValueOnce({ data: { title: '30 Min' }, error: null })

    mockSupabase.lt.mockResolvedValueOnce({ 
      data: [{ id: 'existing-id' }], 
      error: null 
    })
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await createBooking(mockFormData)
    expect(result).toEqual({ error: 'Ya tienes una reserva para este día. Solo se permite una reserva por día.' })
  })

  it('should return requiresDeposit and mpPublicKey if event requires deposit', async () => {
    const mockSupabase = createMockSupabase()

    mockSupabase.single
      .mockResolvedValueOnce({ 
        data: { full_name: 'Jane Smith', mp_public_key: 'OWNER-PUBLIC-KEY' }, 
        error: null 
      })
      .mockResolvedValueOnce({ 
        data: { title: 'Paid Meeting', requires_deposit: true }, 
        error: null 
      })
    
    mockSupabase.lt.mockResolvedValueOnce({ data: [], error: null })
    mockSupabase.lte.mockResolvedValueOnce({ data: [], error: null })
    mockSupabase.single.mockResolvedValueOnce({ data: { id: 'booking-paid' }, error: null })
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await createBooking(mockFormData)
    expect(result).toEqual({ 
      success: true, 
      requiresDeposit: true, 
      mpPublicKey: 'OWNER-PUBLIC-KEY',
      bookingId: 'booking-paid'
    })
    
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      status: 'pending_payment',
      payment_status: 'pending'
    }))
  })
})
