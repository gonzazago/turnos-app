'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { BookingService } from '@/services/booking/service'

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  try {
    const { error } = await BookingService.cancel(bookingId, user.id);
    if (error) throw error;

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error canceling booking:', error)
    return { error: 'No se pudo cancelar la cita.' }
  }
}

export async function rescheduleBooking(bookingId: string, newStartTime: string, newEndTime: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  try {
    const { error } = await BookingService.reschedule(bookingId, user.id, newStartTime, newEndTime);
    if (error) throw error;

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error rescheduling booking:', error)
    return { error: 'No se pudo reprogramar la cita.' }
  }
}
