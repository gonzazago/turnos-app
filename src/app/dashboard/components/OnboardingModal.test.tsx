import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OnboardingModal } from './OnboardingModal'
import { useRouter } from 'next/navigation'
import { getOnboardingStatus, completeOnboarding } from '../onboarding/actions'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('../onboarding/actions', () => ({
  getOnboardingStatus: vi.fn(),
  completeOnboarding: vi.fn(),
}))

describe('OnboardingModal', () => {
  const mockRouter = { push: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
  })

  it('should not render if onboarding is already completed', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({ hasCompletedOnboarding: true })
    
    render(<OnboardingModal />)
    
    await waitFor(() => {
      expect(screen.queryByText(/Bienvenido a turnos.app/i)).toBeNull()
    })
  })

  it('should render if onboarding is not completed', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({ hasCompletedOnboarding: false })
    
    render(<OnboardingModal />)
    
    await waitFor(() => {
      expect(screen.getByText(/Bienvenido a turnos.app/i)).toBeDefined()
    })
  })

  it('should close and redirect to settings when "Saltar guía" is clicked', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({ hasCompletedOnboarding: false })
    vi.mocked(completeOnboarding).mockResolvedValue({ success: true })
    
    render(<OnboardingModal />)
    
    await waitFor(() => {
      expect(screen.getByText(/Bienvenido a turnos.app/i)).toBeDefined()
    })
    
    const skipButton = screen.getByText(/Saltar guía/i)
    fireEvent.click(skipButton)
    
    await waitFor(() => {
      expect(completeOnboarding).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/settings')
    })
  })

  it('should handle "Continuar" through steps (placeholder for now)', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({ hasCompletedOnboarding: false })
    
    render(<OnboardingModal />)
    
    await waitFor(() => {
      expect(screen.getByText(/Bienvenido a turnos.app/i)).toBeDefined()
    })
    
    const continueButton = screen.getByText(/Continuar/i)
    fireEvent.click(continueButton)
    
    // Step 2 should be visible
    expect(screen.getByText(/Personaliza tu perfil/i)).toBeDefined()
  })
})
