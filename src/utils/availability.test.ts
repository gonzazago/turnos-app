import { describe, it, expect } from 'vitest'
import { getAvailableSlots } from './availability'
import { startOfDay } from 'date-fns'

describe('getAvailableSlots', () => {
  const mockAvailability = [
    { day_of_week: 1, start_time: '09:00:00', end_time: '12:00:00' }, // Monday 9-12
  ]

  const mockBookings = [
    {
      start_time: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
      end_time: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
    },
  ]

  it('should return available slots for a given day and duration', () => {
    // Find next Monday that is in the future
    const date = new Date()
    date.setDate(date.getDate() + 7) // Ensure it's next week
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() + 1)
    }
    
    // Set to some specific time (e.g., 21:00) to test the startOfDay fix
    date.setHours(21, 0, 0, 0)
    
    const duration = 30
    const slots = getAvailableSlots(date, mockAvailability, [], duration)

    // Expected slots (9:00, 9:30, 10:00, 10:30, 11:00, 11:30)
    expect(slots).toHaveLength(6)
    
    const dayStart = startOfDay(date)
    const expectedFirstSlot = new Date(dayStart)
    expectedFirstSlot.setHours(9, 0, 0, 0)
    
    expect(slots).toContain(expectedFirstSlot.toISOString())
  })
})
