import { 
  addMinutes, 
  areIntervalsOverlapping, 
} from 'date-fns'

export interface Availability {
  day_of_week: number
  start_time: string
  end_time: string
}

export interface Booking {
  start_time: string
  end_time: string
}

/**
 * Calculates available time slots for a given date based on the user's availability and existing bookings.
 * 
 * @param date The date to check for availability.
 * @param availability A list of availability periods (day_of_week, start_time, end_time).
 * @param bookings A list of existing bookings (start_time, end_time) for the user.
 * @param duration The duration of each slot in minutes.
 * @returns An array of ISO 8601 strings representing the start time of each available slot.
 */
export function getAvailableSlots(
  date: Date,
  availability: Availability[],
  bookings: Booking[],
  duration: number
): string[] {
  // Use UTC day to match ISO strings in tests and ensure consistency
  const dayOfWeek = date.getUTCDay()
  const dayAvailability = availability.filter((a) => a.day_of_week === dayOfWeek)

  if (dayAvailability.length === 0) {
    return []
  }

  const slots: string[] = []

  dayAvailability.forEach((period) => {
    const [startHour, startMin] = period.start_time.split(':').map(Number)
    const [endHour, endMin] = period.end_time.split(':').map(Number)

    // Construct start and end dates in UTC
    const startTime = new Date(date)
    startTime.setUTCHours(startHour, startMin, 0, 0)

    const endTime = new Date(date)
    endTime.setUTCHours(endHour, endMin, 0, 0)

    let currentSlot = new Date(startTime)

    while (addMinutes(currentSlot, duration) <= endTime) {
      const slotEnd = addMinutes(currentSlot, duration)
      
      const isBooked = bookings.some((booking) => {
        const bookingStart = new Date(booking.start_time)
        const bookingEnd = new Date(booking.end_time)
        
        return areIntervalsOverlapping(
          { start: currentSlot, end: slotEnd },
          { start: bookingStart, end: bookingEnd }
        )
      })

      if (!isBooked) {
        slots.push(currentSlot.toISOString())
      }

      currentSlot = addMinutes(currentSlot, duration)
    }
  })

  return slots
}
