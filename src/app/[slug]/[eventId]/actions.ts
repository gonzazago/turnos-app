'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { areIntervalsOverlapping } from 'date-fns'
import { sendBookingConfirmation } from '@/utils/notifications'

export async function createBooking(formData: FormData) {
  const supabase = await createClient()

  const profileId = formData.get('profileId') as string
  const eventId = formData.get('eventId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string

  // Fetch profile and event type info for notifications
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, contact_email')
    .eq('id', profileId)
    .single()

  const { data: eventType } = await supabase
    .from('event_types')
    .select('title')
    .eq('id', eventId)
    .single()

  // Simple availability check: verify no overlapping bookings
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('user_id', profileId)
    .gte('end_time', startTime)
    .lte('start_time', endTime)

  if (existingBookings && existingBookings.length > 0) {
    const isOverlapping = existingBookings.some((booking) => 
      areIntervalsOverlapping(
        { start: new Date(startTime), end: new Date(endTime) },
        { start: new Date(booking.start_time), end: new Date(booking.end_time) }
      )
    )

    if (isOverlapping) {
      return { error: 'Lo sentimos, este horario ya ha sido reservado. Por favor, selecciona otro.' }
    }
  }

  const { error } = await supabase
    .from('bookings')
    .insert({
      user_id: profileId,
      event_type_id: eventId,
      booker_name: name,
      booker_email: email,
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed'
    })

  if (error) {
    console.error(error)
    // Handle PostgreSQL exclusion constraint violation (23P01)
    if (error.code === '23P01') {
      return { error: 'Lo sentimos, este horario ya ha sido reservado. Por favor, selecciona otro.' }
    }
    return { error: 'Ocurrió un error al procesar tu reserva. Intenta nuevamente.' }
  }

  // Send confirmation emails
  if (profile && eventType) {
    sendBookingConfirmation({
      booker_name: name,
      booker_email: email,
      provider_name: profile.full_name || 'El Proveedor',
      provider_email: profile.contact_email || 'no-reply@ejemplo.com',
      event_title: eventType.title,
      start_time: startTime
    }).catch(err => console.error('Error sending confirmation email:', err))
  }

  revalidatePath('/dashboard')
  return { success: true }
}
