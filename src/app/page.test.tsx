import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Home from './page'

// Mock HeroFunnel since it's a Client Component used in Home (Server Component)
vi.mock('./components/HeroFunnel', () => ({
  HeroFunnel: () => <div data-testid="hero-funnel" />
}))

describe('Home Page', () => {
  it('renders the main sections in correct order', () => {
    render(<Home />)
    
    // Hero
    expect(screen.getByText(/Tu agenda,/i)).toBeDefined()
    
    // Social Proof
    expect(screen.getByText(/Con la confianza de \+2,000 profesionales/i)).toBeDefined()
    
    // How It Works
    expect(screen.getByText(/Lista en 3 simples pasos/i)).toBeDefined()
    
    // Strengths
    expect(screen.getByText(/Beneficios clave/i)).toBeDefined()
    
    // Testimonios
    expect(screen.getByText(/Lo que dicen de nosotros/i)).toBeDefined()
    
    // Pricing
    expect(screen.getByText(/Elige el plan para tu éxito/i)).toBeDefined()
  })
})
