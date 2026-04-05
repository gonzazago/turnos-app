'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  // Use the regular supabase client to enforce RLS ownership
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)
    // We keep eq('user_id', user.id) for extra safety, 
    // although RLS already enforces it.
    .eq('user_id', user.id)

  if (error) {
    console.error('Error canceling booking:', error)
    return { error: 'No se pudo cancelar la cita.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function rescheduleBooking(bookingId: string, newStartTime: string, newEndTime: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  // Use the regular supabase client to enforce RLS ownership
  const { error } = await supabase
    .from('bookings')
    .update({
      start_time: newStartTime,
      end_time: newEndTime
    })
    .eq('id', bookingId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error rescheduling booking:', error)
    return { error: 'No se pudo reprogramar la cita.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
