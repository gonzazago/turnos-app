import { describe, it, expect, vi } from 'vitest'
import { sendBookingConfirmation } from './notifications'

describe('sendBookingConfirmation', () => {
  it('should attempt to send an email with correct data', async () => {
    const bookingData = {
      booker_name: 'John Doe',
      booker_email: 'john@example.com',
      provider_name: 'Jane Smith',
      provider_email: 'jane@example.com',
      event_title: '30 Min Meeting',
      start_time: '2026-03-30T10:00:00Z',
      booking_id: 'booking-123',
      cancel_token: 'token-123'
    }

    // Since we don't have a real service yet, we'll just check if it doesn't throw
    const result = await sendBookingConfirmation(bookingData)
    expect(result).toEqual({ success: true })
  })
})
