import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HeroFunnel } from './HeroFunnel'
import { useRouter } from 'next/navigation'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

describe('HeroFunnel', () => {
  it('should render the slug input and button', () => {
    render(<HeroFunnel />)
    expect(screen.getByPlaceholderText(/tu-nombre/i)).toBeDefined()
    expect(screen.getByText(/Reclamar mi enlace/i)).toBeDefined()
  })

  it('should render the dark variant', () => {
    render(<HeroFunnel variant="dark" />)
    // Just verify it renders without error
    expect(screen.getByText(/turnos.app\//i)).toBeDefined()
  })

  it('should redirect to register with slug on submit', () => {
    const mockPush = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    
    render(<HeroFunnel />)
    
    const input = screen.getByPlaceholderText(/tu-nombre/i)
    fireEvent.change(input, { target: { value: 'JuanPerez' } })
    
    const button = screen.getByText(/Reclamar mi enlace/i)
    fireEvent.click(button)
    
    expect(mockPush).toHaveBeenCalledWith('/register?slug=juanperez')
  })
})
