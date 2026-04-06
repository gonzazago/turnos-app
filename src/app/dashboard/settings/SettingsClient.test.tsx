import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SettingsForm } from './SettingsClient'
import { useSearchParams } from 'next/navigation'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn(),
  })),
}))

vi.mock('./actions', () => ({
  updateProfile: vi.fn(),
  disconnectPaymentAccount: vi.fn(),
}))

describe('SettingsForm Google Calendar', () => {
  it('should render Connect Google Calendar button when not connected', () => {
    const profile = {
      full_name: 'John Doe',
      slug: 'johndoe',
      google_calendar_connected: false,
    }
    
    render(<SettingsForm profile={profile} />)
    
    expect(screen.getByText(/Conectar Google Calendar/i)).toBeDefined()
    expect(screen.getByRole('link', { name: /Conectar Google Calendar/i })).toHaveAttribute('href', '/api/auth/google/authorize')
  })

  it('should render Connected status when connected', () => {
    const profile = {
      full_name: 'John Doe',
      slug: 'johndoe',
      google_calendar_connected: true,
    }
    
    render(<SettingsForm profile={profile} />)
    
    expect(screen.getByText(/Google Calendar Conectado/i)).toBeDefined()
  })
})
