import { addDays, getDay, isSameDay } from 'date-fns'

/**
 * Calculates the series of dates for a session package.
 * 
 * @param startDate The initial date and time selected by the user.
 * @param sessionCount Total number of sessions to schedule.
 * @param allowedDays Array of day indices (0-6) when sessions can occur.
 * @returns Array of Date objects representing all sessions.
 */
export function calculatePackageDates(
  startDate: Date,
  sessionCount: number,
  allowedDays: number[]
): Date[] {
  if (allowedDays.length === 0) return [startDate]
  
  const dates: Date[] = []
  let currentDate = new Date(startDate)
  
  // Safety break to prevent infinite loops if allowedDays is empty or invalid
  let iterations = 0
  const maxIterations = sessionCount * 40 // Max ~40 weeks lookahead

  while (dates.length < sessionCount && iterations < maxIterations) {
    const dayOfWeek = getDay(currentDate)
    
    if (allowedDays.includes(dayOfWeek)) {
      dates.push(new Date(currentDate))
    }
    
    currentDate = addDays(currentDate, 1)
    iterations++
  }

  return dates
}
