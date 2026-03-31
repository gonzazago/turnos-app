import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingDetailsModal } from './BookingDetailsModal';
import React from 'react';

describe('BookingDetailsModal', () => {
  const mockBooking = {
    id: 'booking-123',
    booker_name: 'John Doe',
    booker_email: 'john@example.com',
    start_time: '2026-03-31T10:00:00Z',
    end_time: '2026-03-31T10:30:00Z',
    event_types: {
      title: 'Coffee Chat',
      duration_mins: 30,
      requires_deposit: true,
      total_price: 50,
      deposit_percentage: 20
    },
    billing_info: {
      address: '123 Test St'
    }
  };

  it('renders booking details correctly', () => {
    const onClose = vi.fn();
    render(<BookingDetailsModal booking={mockBooking} onClose={onClose} />);

    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('john@example.com')).toBeDefined();
    expect(screen.getByText('Coffee Chat')).toBeDefined();
    expect(screen.getByText('ID de Reserva:')).toBeDefined();
    expect(screen.getByText('booking-123')).toBeDefined();
  });

  it('displays payment info when required', () => {
    const onClose = vi.fn();
    render(<BookingDetailsModal booking={mockBooking} onClose={onClose} />);

    expect(screen.getByText('Información de Pago')).toBeDefined();
    expect(screen.getByText('$10.00')).toBeDefined(); // 20% of 50
    expect(screen.getByText('$50')).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<BookingDetailsModal booking={mockBooking} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
