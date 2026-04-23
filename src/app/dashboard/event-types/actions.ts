'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createEventType(
  formData: FormData, 
  availability: { day_of_week: number, start_time: string, end_time: string }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  const planType = profile?.plan_type || 'free'

  if (planType === 'free') {
    const { count } = await supabase
      .from('event_types')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    if (count !== null && count >= 1) {
      return { error: 'Los usuarios Free solo pueden tener 1 tipo de evento. Por favor, actualiza tu plan.' }
    }
  }

  const title = formData.get('title') as string
  const duration_mins = parseInt(formData.get('duration_mins') as string)
  const description = formData.get('description') as string
  const requires_deposit = formData.get('requiresDeposit') === 'on'
  const total_price = parseFloat(formData.get('totalPrice') as string || '0')
  const deposit_percentage = parseFloat(formData.get('depositPercentage') as string || '0')

  const { data: eventType, error } = await supabase
    .from('event_types')
    .insert({
      user_id: user.id,
      title,
      duration_mins,
      description,
      requires_deposit,
      total_price,
      deposit_percentage
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    return { error: 'No se pudo crear el tipo de evento.' }
  }

  if (availability.length > 0) {
    const { error: availabilityError } = await supabase
      .from('availability')
      .insert(
        availability.map(a => ({
          ...a,
          user_id: user.id,
          event_type_id: eventType.id
        }))
      )

    if (availabilityError) {
      console.error(availabilityError)
      // We don't fail the whole event creation, but we should log it
    }
  }

  revalidatePath('/dashboard/event-types')
  return { success: true }
}

export async function updateEventType(
  id: string,
  formData: FormData, 
  availability: { day_of_week: number, start_time: string, end_time: string }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const duration_mins = parseInt(formData.get('duration_mins') as string)
  const description = formData.get('description') as string
  const requires_deposit = formData.get('requiresDeposit') === 'on'
  const total_price = parseFloat(formData.get('totalPrice') as string || '0')
  const deposit_percentage = parseFloat(formData.get('depositPercentage') as string || '0')

  const { error } = await supabase
    .from('event_types')
    .update({
      title,
      duration_mins,
      description,
      requires_deposit,
      total_price,
      deposit_percentage
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error(error)
    return { error: 'No se pudo actualizar el tipo de evento.' }
  }

  // Update availability: simplest way is to delete and re-insert
  await supabase
    .from('availability')
    .delete()
    .eq('event_type_id', id)
    .eq('user_id', user.id)

  if (availability.length > 0) {
    const { error: availabilityError } = await supabase
      .from('availability')
      .insert(
        availability.map(a => ({
          ...a,
          user_id: user.id,
          event_type_id: id
        }))
      )

    if (availabilityError) {
      console.error(availabilityError)
    }
  }

  revalidatePath('/dashboard/event-types')
  return { success: true }
}

export async function deleteEventType(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('event_types')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error(error)
    return { error: 'Error al eliminar.' }
  }

  revalidatePath('/dashboard/event-types')
  return { success: true }
}
