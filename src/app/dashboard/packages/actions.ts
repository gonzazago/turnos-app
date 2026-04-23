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
  const variants = JSON.parse(formData.get('variants') as string || '[]')
  const allowedDays = JSON.parse(formData.get('allowedDays') as string || '[]')
  const frequencyPerWeek = parseInt(formData.get('frequencyPerWeek') as string || '1')

  if (!name || !schedulingType || variants.length === 0) {
    return { error: 'El nombre y al menos una variante son obligatorios' }
  }

  const payload: any = {
    provider_id: user.id,
    name,
    scheduling_type: schedulingType,
    variants,
    allowed_days: allowedDays,
    frequency_per_week: frequencyPerWeek,
    // Set first variant as default for compatibility with older components if any
    session_count: variants[0].session_count,
    total_price: variants[0].price
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

export async function updatePackage(packageId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  const name = formData.get('name') as string
  const eventTypeId = formData.get('eventTypeId') as string
  const schedulingType = formData.get('schedulingType') as string
  const variants = JSON.parse(formData.get('variants') as string || '[]')
  const allowedDays = JSON.parse(formData.get('allowedDays') as string || '[]')
  const frequencyPerWeek = parseInt(formData.get('frequencyPerWeek') as string || '1')

  if (!name || !schedulingType || variants.length === 0) {
    return { error: 'El nombre y al menos una variante son obligatorios' }
  }

  const payload: any = {
    name,
    scheduling_type: schedulingType,
    variants,
    allowed_days: allowedDays,
    frequency_per_week: frequencyPerWeek,
    session_count: variants[0].session_count,
    total_price: variants[0].price
  }

  if (eventTypeId && eventTypeId !== 'none') {
    payload.event_type_id = eventTypeId
  } else {
    payload.event_type_id = null
  }

  const { error } = await supabase
    .from('session_packages')
    .update(payload)
    .eq('id', packageId)
    .eq('provider_id', user.id)

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
