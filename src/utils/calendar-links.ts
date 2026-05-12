import { addMinutes, parseISO } from 'date-fns'

export interface CalendarEvent {
  title: string
  description?: string
  location?: string
  startTime: string | Date // ISO string or Date
  durationMins: number
}

function formatGoogleDate(date: Date): string {
  // Google wants YYYYMMDDTHHmmSSZ (UTC)
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function formatOutlookDate(date: Date): string {
  // Outlook wants YYYY-MM-DDTHH:mm:ssZ
  return date.toISOString().replace(/\.\d{3}/, '')
}

export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const start = typeof event.startTime === 'string' ? parseISO(event.startTime) : event.startTime
  const end = addMinutes(start, event.durationMins)

  const url = new URL('https://calendar.google.com/calendar/render')
  url.searchParams.append('action', 'TEMPLATE')
  url.searchParams.append('text', event.title)
  url.searchParams.append('dates', `${formatGoogleDate(start)}/${formatGoogleDate(end)}`)
  if (event.description) url.searchParams.append('details', event.description)
  if (event.location) url.searchParams.append('location', event.location)
  
  return url.toString()
}

export function getOutlookCalendarUrl(event: CalendarEvent): string {
  const start = typeof event.startTime === 'string' ? parseISO(event.startTime) : event.startTime
  const end = addMinutes(start, event.durationMins)

  const url = new URL('https://outlook.live.com/calendar/0/deeplink/compose')
  url.searchParams.append('path', '/calendar/action/compose')
  url.searchParams.append('rru', 'addevent')
  url.searchParams.append('subject', event.title)
  url.searchParams.append('startdt', formatOutlookDate(start))
  url.searchParams.append('enddt', formatOutlookDate(end))
  if (event.description) url.searchParams.append('body', event.description)
  if (event.location) url.searchParams.append('location', event.location)

  return url.toString()
}

export function generateIcsContent(event: CalendarEvent): string {
  const start = typeof event.startTime === 'string' ? parseISO(event.startTime) : event.startTime
  const end = addMinutes(start, event.durationMins)
  
  const formattedStart = formatGoogleDate(start)
  const formattedEnd = formatGoogleDate(end)
  const now = formatGoogleDate(new Date())

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TurnosApp//NONSGML v1.0//EN',
    'BEGIN:VEVENT',
    `DTSTAMP:${now}`,
    `DTSTART:${formattedStart}`,
    `DTEND:${formattedEnd}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n')
}

export function downloadIcsFile(event: CalendarEvent): void {
  const content = generateIcsContent(event)
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
