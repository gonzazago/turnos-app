'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createEventType(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const duration_mins = parseInt(formData.get('duration_mins') as string)
  const description = formData.get('description') as string

  const { error } = await supabase
    .from('event_types')
    .insert({
      user_id: user.id,
      title,
      duration_mins,
      description
    })

  if (error) {
    console.error(error)
    return { error: 'No se pudo crear el tipo de evento.' }
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
