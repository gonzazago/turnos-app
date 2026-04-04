import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardNav } from './DashboardNav'
import React from 'react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

// Mock lucide-react icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react') as any
  return {
    ...actual,
    Calendar: () => <div data-testid="icon-calendar" />,
    Clock: () => <div data-testid="icon-clock" />,
    Settings: () => <div data-testid="icon-settings" />,
    LogOut: () => <div data-testid="icon-logout" />,
    Menu: () => <div data-testid="icon-menu" />,
    X: () => <div data-testid="icon-x" />,
  }
})

describe('DashboardNav', () => {
  const mockProfile = {
    full_name: 'John Doe',
    slug: 'johndoe',
    logo_url: null,
  }
  const mockEmail = 'john@example.com'

  it('renders profile name and email', () => {
    render(<DashboardNav profile={mockProfile} userEmail={mockEmail} />)
    
    // Check if it renders in desktop sidebar (NavContent is used twice)
    const names = screen.getAllByText('John Doe')
    expect(names.length).toBeGreaterThan(0)
    
    const emails = screen.getAllByText('/johndoe')
    expect(emails.length).toBeGreaterThan(0)
  })

  it('renders navigation links', () => {
    render(<DashboardNav profile={mockProfile} userEmail={mockEmail} />)
    
    const links = screen.getAllByRole('link')
    expect(links.some(link => link.getAttribute('href') === '/dashboard')).toBe(true)
    expect(links.some(link => link.getAttribute('href') === '/dashboard/event-types')).toBe(true)
    expect(links.some(link => link.getAttribute('href') === '/dashboard/settings')).toBe(true)
  })
})
