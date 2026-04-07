import { startOfDay, endOfDay } from 'date-fns'

const API_URL = 'https://date.nager.at/api/v3/PublicHolidays'

export async function getARHolidays(year: number): Promise<{ start_time: string, end_time: string }[]> {
  try {
    const res = await fetch(`${API_URL}/${year}/AR`)
    if (!res.ok) return []
    const holidays = await res.json()
    
    return holidays.map((h: any) => {
      const date = new Date(h.date + 'T00:00:00') // Local date mapping
      return {
        start_time: startOfDay(date).toISOString(),
        end_time: endOfDay(date).toISOString()
      }
    })
  } catch (err) {
    console.error('Error fetching holidays', err)
    return []
  }
}
