import { 
  addMinutes, 
  areIntervalsOverlapping, 
  getDay,
  startOfDay,
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
 * If no availability is defined, it defaults to a standard 09:00 - 17:00 schedule.
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
  // Use local day to match user's perspective and format() output
  const dayOfWeek = getDay(date)
  
  // Use provided availability OR default to 09:00-17:00 if none exists
  let dayAvailability = availability.filter((a) => a.day_of_week === dayOfWeek)

  if (dayAvailability.length === 0 && availability.length === 0) {
    // Default availability: Mon-Fri 09:00 - 17:00
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      dayAvailability = [{ day_of_week: dayOfWeek, start_time: '09:00:00', end_time: '17:00:00' }]
    }
  }

  if (dayAvailability.length === 0) {
    return []
  }

  const slots: string[] = []

  dayAvailability.forEach((period) => {
    const [startHour, startMin] = period.start_time.split(':').map(Number)
    const [endHour, endMin] = period.end_time.split(':').map(Number)

    // Construct start and end dates in local time, starting from midnight
    const dayStart = startOfDay(date)
    
    const startTime = new Date(dayStart)
    startTime.setHours(startHour, startMin, 0, 0)

    const endTime = new Date(dayStart)
    endTime.setHours(endHour, endMin, 0, 0)

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
        // Only add slot if it's in the future
        if (currentSlot.getTime() > new Date().getTime()) {
          slots.push(currentSlot.toISOString())
        }
      }

      currentSlot = addMinutes(currentSlot, duration)
    }
  })

  // Sort slots to ensure they are in chronological order
  return slots.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
}
