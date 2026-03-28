'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBooking(formData: FormData) {
  const supabase = await createClient()

  const profileId = formData.get('profileId') as string
  const eventId = formData.get('eventId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string

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
    return { error: 'Ocurrió un error al procesar tu reserva. Intenta nuevamente.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
