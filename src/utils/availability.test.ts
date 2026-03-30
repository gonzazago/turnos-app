import { describe, it, expect } from 'vitest'
import { getAvailableSlots } from './availability'

describe('getAvailableSlots', () => {
  const mockAvailability = [
    { day_of_week: 1, start_time: '09:00:00', end_time: '12:00:00' }, // Monday 9-12
  ]

  const mockBookings = [
    {
      start_time: '2026-03-30T10:00:00Z', // Monday
      end_time: '2026-03-30T10:30:00Z',
    },
  ]

  it('should return available slots for a given day and duration', () => {
    const date = new Date('2026-03-30T00:00:00Z')
    const duration = 30
    const slots = getAvailableSlots(date, mockAvailability, mockBookings, duration)

    // Expected slots (9:00-12:00, with 10:00-10:30 booked)
    // 9:00, 9:30, 10:30, 11:00, 11:30
    expect(slots).toContain('2026-03-30T09:00:00.000Z')
    expect(slots).toContain('2026-03-30T09:30:00.000Z')
    expect(slots).not.toContain('2026-03-30T10:00:00.000Z')
    expect(slots).toContain('2026-03-30T10:30:00.000Z')
    expect(slots).toHaveLength(5)
  })

  it('should return no slots if the day is not in availability', () => {
    const date = new Date('2026-03-29T00:00:00Z') // Sunday
    const duration = 30
    const slots = getAvailableSlots(date, mockAvailability, [], duration)
    expect(slots).toHaveLength(0)
  })

  it('should handle multiple availability periods on the same day', () => {
    const date = new Date('2026-03-30T00:00:00Z')
    const availability = [
      { day_of_week: 1, start_time: '09:00:00', end_time: '10:00:00' },
      { day_of_week: 1, start_time: '14:00:00', end_time: '15:00:00' },
    ]
    const slots = getAvailableSlots(date, availability, [], 30)
    // 9:00, 9:30, 14:00, 14:30
    expect(slots).toHaveLength(4)
    expect(slots).toContain('2026-03-30T09:00:00.000Z')
    expect(slots).toContain('2026-03-30T14:30:00.000Z')
  })

  it('should handle bookings that partially overlap slots', () => {
    const date = new Date('2026-03-30T00:00:00Z')
    const availability = [{ day_of_week: 1, start_time: '09:00:00', end_time: '10:00:00' }]
    const bookings = [
      {
        start_time: '2026-03-30T09:15:00Z',
        end_time: '2026-03-30T09:45:00Z',
      },
    ]
    const slots = getAvailableSlots(date, availability, bookings, 30)
    // 9:00-9:30 overlaps (ends at 9:30, booking starts at 9:15)
    // 9:30-10:00 overlaps (starts at 9:30, booking ends at 9:45)
    expect(slots).toHaveLength(0)
  })
})
