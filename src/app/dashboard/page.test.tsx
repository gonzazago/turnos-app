import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardPage from './page'
import { createClient } from '@/utils/supabase/server'
import { BookingService } from '@/services/booking/service'

// Mock Supabase
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock BookingService
vi.mock('@/services/booking/service', () => ({
  BookingService: {
    getProviderDashboardBookings: vi.fn(),
  },
}))

// Mock ClientDashboard and OnboardingModal
vi.mock('./components/ClientDashboard', () => ({
  ClientDashboard: () => <div data-testid="client-dashboard" />
}))

vi.mock('./components/OnboardingModal', () => ({
  OnboardingModal: () => <div data-testid="onboarding-modal" />
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    const error = new Error('NEXT_REDIRECT') as any
    error.digest = `NEXT_REDIRECT;replace;${url};307;`
    throw error
  }),
}))

describe('Dashboard Page', () => {
  const mockUser = { id: 'user-123' }

  beforeEach(() => {
    vi.clearAllMocks()
    
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    vi.mocked(BookingService.getProviderDashboardBookings).mockResolvedValue([])
  })

  it('renders the dashboard title and main components', async () => {
    const Result = await DashboardPage()
    render(Result)
    
    expect(screen.getByText(/Tu Panel/i)).toBeDefined()
    expect(screen.getByTestId('client-dashboard')).toBeDefined()
    expect(screen.getByTestId('onboarding-modal')).toBeDefined()
  })

  it('redirects to login if not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    
    await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT')
    const { redirect } = await import('next/navigation')
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
