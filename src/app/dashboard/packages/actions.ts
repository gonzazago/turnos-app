'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPackage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  // Gatekeeping: limit packages to PRO and ULTRA
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  if (profile?.plan_type === 'free') {
    return { error: 'La venta de paquetes de sesiones es exclusiva para los planes Pro y Ultra.' }
  }

  const name = formData.get('name') as string
  const eventTypeId = formData.get('eventTypeId') as string
  const schedulingType = formData.get('schedulingType') as string
  const sessionCount = parseInt(formData.get('sessionCount') as string, 10)
  const totalPrice = parseFloat(formData.get('totalPrice') as string)

  if (!name || !schedulingType || isNaN(sessionCount) || isNaN(totalPrice)) {
    return { error: 'Todos los campos son obligatorios' }
  }

  if (sessionCount <= 0 || totalPrice <= 0) {
    return { error: 'Los valores de sesiones y precio deben ser mayores a 0' }
  }

  const payload: any = {
    provider_id: user.id,
    name,
    scheduling_type: schedulingType,
    session_count: sessionCount,
    total_price: totalPrice,
  }

  if (eventTypeId && eventTypeId !== 'none') {
    payload.event_type_id = eventTypeId
  }

  const { error } = await supabase
    .from('session_packages')
    .insert(payload)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/packages')
  return { success: true }
}

export async function deletePackage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  const packageId = formData.get('packageId') as string
  if (!packageId) return { error: 'ID de paquete inválido' }

  const { error } = await supabase
    .from('session_packages')
    .delete()
    .eq('id', packageId)
    .eq('provider_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/packages')
  return { success: true }
}
