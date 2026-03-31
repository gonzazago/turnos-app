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

  it('should return error if database constraint fails (concurrent booking)', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({
        error: { code: '23P01', message: 'Exclusion constraint violation' }
      }),
    }
    
    // Simulate the chain for the manual check
    mockSupabase.from.mockReturnThis()
    mockSupabase.select.mockReturnThis()
    mockSupabase.eq.mockReturnThis()
    mockSupabase.single.mockResolvedValueOnce({ data: { full_name: 'Jane Smith', contact_email: 'jane@example.com' }, error: null }) // profile
    mockSupabase.single.mockResolvedValueOnce({ data: { title: '30 Min Meeting' }, error: null }) // eventType
    
    // Daily check (empty)
    mockSupabase.lt.mockResolvedValueOnce({ data: [], error: null })
    
    mockSupabase.gte.mockReturnThis()
    mockSupabase.lte.mockResolvedValueOnce({ data: [], error: null })
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await createBooking(mockFormData)
    expect(result).toEqual({ error: 'Lo sentimos, este horario ya ha sido reservado. Por favor, selecciona otro.' })
  })

  it('should return error if manual check finds overlapping booking', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
    }

    mockSupabase.single.mockResolvedValueOnce({ data: { full_name: 'Jane Smith', contact_email: 'jane@example.com' }, error: null }) // profile
    mockSupabase.single.mockResolvedValueOnce({ data: { title: '30 Min Meeting' }, error: null }) // eventType
    
    // Daily check (empty)
    mockSupabase.lt.mockResolvedValueOnce({ data: [], error: null })

    mockSupabase.lte.mockResolvedValueOnce({ 
      data: [{ start_time: '2026-03-30T10:00:00Z', end_time: '2026-03-30T10:30:00Z' }], 
      error: null 
    }),
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await createBooking(mockFormData)
    expect(result).toEqual({ error: 'Lo sentimos, este horario ya ha sido reservado. Por favor, selecciona otro.' })
  })

  it('should return success if booking is created successfully', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }

    mockSupabase.single.mockResolvedValueOnce({ data: { full_name: 'Jane Smith', contact_email: 'jane@example.com' }, error: null }) // profile
    mockSupabase.single.mockResolvedValueOnce({ data: { title: '30 Min Meeting' }, error: null }) // eventType
    
    // Daily check (empty)
    mockSupabase.lt.mockResolvedValueOnce({ data: [], error: null })

    mockSupabase.lte.mockResolvedValueOnce({ data: [], error: null }),
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await createBooking(mockFormData)
    expect(result).toEqual({ success: true })
  })

  it('should return error if database insert fails with generic error', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: { code: '500', message: 'Internal Server Error' } }),
    }

    mockSupabase.single.mockResolvedValueOnce({ data: { full_name: 'Jane Smith', contact_email: 'jane@example.com' }, error: null }) // profile
    mockSupabase.single.mockResolvedValueOnce({ data: { title: '30 Min Meeting' }, error: null }) // eventType
    
    // Daily check (empty)
    mockSupabase.lt.mockResolvedValueOnce({ data: [], error: null })

    mockSupabase.lte.mockResolvedValueOnce({ data: [], error: null }),
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await createBooking(mockFormData)
    expect(result).toEqual({ error: 'Ocurrió un error al procesar tu reserva. Intenta nuevamente.' })
  })

  it('should return error if the same email has already booked on the same day', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      insert: vi.fn(),
    }

    // Mock profile and eventType
    mockSupabase.single.mockResolvedValueOnce({ data: { full_name: 'Jane Smith', contact_email: 'jane@example.com' }, error: null }) // profile
    mockSupabase.single.mockResolvedValueOnce({ data: { title: '30 Min Meeting' }, error: null }) // eventType

    // Mock check for existing booking by same email on same day
    mockSupabase.lt.mockResolvedValueOnce({ 
      data: [{ id: 'existing-id' }], 
      error: null 
    })
    
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await createBooking(mockFormData)
    expect(result).toEqual({ error: 'Ya tienes una reserva para este día. Solo se permite una reserva por día.' })
  })
})
