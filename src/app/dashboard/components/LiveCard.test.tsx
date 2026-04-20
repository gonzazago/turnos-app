import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LiveCard } from './LiveCard'

describe('LiveCard', () => {
  const defaultProps = {
    fullName: 'Juan Pérez',
    brandColor: '#3b82f6',
    logoUrl: '',
    fontFamily: 'Inter',
  }

  it('renders correctly with default props', () => {
    render(<LiveCard {...defaultProps} />)
    expect(screen.getByText('Juan Pérez')).toBeDefined()
  })

  it('updates when props change', () => {
    const { rerender } = render(<LiveCard {...defaultProps} />)
    expect(screen.getByText('Juan Pérez')).toBeDefined()

    rerender(<LiveCard {...defaultProps} fullName="María García" />)
    expect(screen.getByText('María García')).toBeDefined()
  })

  it('displays logo when logoUrl is provided', () => {
    render(<LiveCard {...defaultProps} logoUrl="https://example.com/logo.png" />)
    const logo = screen.getByAltText('Logo')
    expect(logo).toBeDefined()
    expect(logo.getAttribute('src')).toBe('https://example.com/logo.png')
  })
})
