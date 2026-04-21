import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OnboardingModalClient as OnboardingModal } from './OnboardingModalClient'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '../onboarding/actions'
import { updateProfile } from '../settings/actions'
import { createEventType } from '../event-types/actions'
import React, { Suspense } from 'react'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}))

vi.mock('../onboarding/actions', () => ({
  completeOnboarding: vi.fn(),
}))

vi.mock('../settings/actions', () => ({
  updateProfile: vi.fn(),
}))

vi.mock('../event-types/actions', () => ({
  createEventType: vi.fn(),
}))

describe('OnboardingModal', () => {
  const mockRouter = { push: vi.fn(), refresh: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue(mockRouter as any)
  })

  const renderModal = async (profile: any) => {
    const promise = Promise.resolve({ profile })
    await act(async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <OnboardingModal onboardingDataPromise={promise} />
        </Suspense>
      )
    })
  }

  it('should not render if onboarding is already completed', async () => {
    await renderModal({ has_completed_onboarding: true })
    
    await waitFor(() => {
       const modal = screen.queryByText(/Bienvenido/i)
       expect(modal).toBeNull()
    })
  })

  it('should render if onboarding is not completed', async () => {
    await renderModal({ 
      has_completed_onboarding: false,
      slug: 'test-user',
      full_name: 'Test User'
    })
    
    expect(await screen.findByText(/¡Tu plataforma está lista!/i)).toBeDefined()
  })

  it('should close and redirect to settings when "Saltar guía" is clicked', async () => {
    vi.mocked(completeOnboarding).mockResolvedValue({ success: true })
    await renderModal({ has_completed_onboarding: false })
    
    const skipButton = await screen.findByText(/Saltar guía/i)
    await act(async () => {
       fireEvent.click(skipButton)
    })
    
    await waitFor(() => {
      expect(completeOnboarding).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/settings')
    })
  })

  it('should handle "Continuar" through steps', async () => {
    await renderModal({ has_completed_onboarding: false })
    
    const continueButton = await screen.findByText(/Continuar/i)
    await act(async () => {
      fireEvent.click(continueButton)
    })
    
    expect(await screen.findByText(/Personaliza tu perfil/i)).toBeDefined()
  })

  it('should allow updating profile settings in Step 2', async () => {
    await renderModal({ 
      has_completed_onboarding: false,
      slug: 'test-user',
      full_name: 'Test User'
    })
    
    await act(async () => {
      fireEvent.click(await screen.findByText(/Continuar/i))
    })
    
    const nameInput = await screen.findByLabelText(/Nombre público/i)
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Nuevo Nombre' } })
    })
    
    expect(screen.getByTestId('live-card')).toBeDefined()
    expect(screen.getByText('Nuevo Nombre')).toBeDefined()
  })

  it('should complete onboarding after creating first event in Step 3', async () => {
    vi.mocked(updateProfile).mockResolvedValue({ success: true, slug: 'test-user' })
    vi.mocked(createEventType).mockResolvedValue({ success: true })
    vi.mocked(completeOnboarding).mockResolvedValue({ success: true })
    
    await renderModal({ 
      has_completed_onboarding: false,
      slug: 'test-user',
      full_name: 'Test User'
    })
    
    await act(async () => {
      fireEvent.click(await screen.findByText(/Continuar/i))
    })
    
    const nextBtn = await screen.findByText(/Siguiente: Mi primer servicio/i)
    await act(async () => {
      fireEvent.click(nextBtn)
    })
    
    const eventNameInput = await screen.findByLabelText(/Nombre del servicio/i)
    await act(async () => {
      fireEvent.change(eventNameInput, { target: { value: 'Mi Servicio' } })
    })
    
    const finishButton = screen.getByText(/Finalizar configuración/i)
    await act(async () => {
      fireEvent.click(finishButton)
    })
    
    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled()
      expect(createEventType).toHaveBeenCalled()
      expect(completeOnboarding).toHaveBeenCalled()
      expect(screen.getByText(/¡Todo listo!/i)).toBeDefined()
    })

    await act(async () => {
      fireEvent.click(screen.getByText(/Ir al Panel/i))
    })
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
  })
})
