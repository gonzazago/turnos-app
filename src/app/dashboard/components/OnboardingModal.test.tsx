import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OnboardingModal } from './OnboardingModal'
import { useRouter } from 'next/navigation'
import { getOnboardingStatus, completeOnboarding } from '../onboarding/actions'
import { updateProfile } from '../settings/actions'
import { createEventType } from '../event-types/actions'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('../onboarding/actions', () => ({
  getOnboardingStatus: vi.fn(),
  completeOnboarding: vi.fn(),
}))

vi.mock('../settings/actions', () => ({
  updateProfile: vi.fn(),
}))

vi.mock('../event-types/actions', () => ({
  createEventType: vi.fn(),
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

  it('should allow updating profile settings in Step 2', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({ hasCompletedOnboarding: false })
    
    render(<OnboardingModal />)
    
    await waitFor(() => {
      expect(screen.getByText(/Bienvenido a turnos.app/i)).toBeDefined()
    })
    
    fireEvent.click(screen.getByText(/Continuar/i))
    
    // Check for Step 2 elements
    expect(screen.getByText(/Personaliza tu perfil/i)).toBeDefined()
    
    // Check for name input (it should be pre-filled or available)
    const nameInput = screen.getByLabelText(/Nombre público/i)
    fireEvent.change(nameInput, { target: { value: 'Nuevo Nombre' } })
    
    // Live card should reflect changes
    expect(screen.getByTestId('live-card')).toBeDefined()
    expect(screen.getByText('Nuevo Nombre')).toBeDefined()
  })

  it('should complete onboarding after creating first event in Step 3', async () => {
    vi.mocked(getOnboardingStatus).mockResolvedValue({ hasCompletedOnboarding: false })
    vi.mocked(updateProfile).mockResolvedValue({ success: true })
    vi.mocked(createEventType).mockResolvedValue({ success: true })
    vi.mocked(completeOnboarding).mockResolvedValue({ success: true })
    
    render(<OnboardingModal />)
    
    await waitFor(() => {
      expect(screen.getByText(/Bienvenido a turnos.app/i)).toBeDefined()
    })
    
    // Step 1 -> 2
    fireEvent.click(screen.getByText(/Continuar/i))
    
    // Step 2 -> 3
    fireEvent.click(screen.getByText(/Siguiente: Mi primer servicio/i))
    
    // Step 3
    expect(screen.getByText(/Tu primer servicio/i)).toBeDefined()
    
    const eventNameInput = screen.getByLabelText(/Nombre del servicio/i)
    fireEvent.change(eventNameInput, { target: { value: 'Mi Servicio' } })
    
    const durationInput = screen.getByLabelText(/Duración/i)
    fireEvent.change(durationInput, { target: { value: '60' } })
    
    const finishButton = screen.getByText(/Finalizar configuración/i)
    fireEvent.click(finishButton)
    
    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled()
      expect(createEventType).toHaveBeenCalled()
      expect(completeOnboarding).toHaveBeenCalled()
      // Step 4 should be visible
      expect(screen.getByText(/¡Todo listo!/i)).toBeDefined()
    })

    // Click "Ir al Panel"
    fireEvent.click(screen.getByText(/Ir al Panel/i))
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
  })
})
