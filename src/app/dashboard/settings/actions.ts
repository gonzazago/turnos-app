'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const fullName = formData.get('fullName') as string
  const slug = formData.get('slug') as string
  const brandColor = formData.get('brandColor') as string
  const logoFile = formData.get('logo') as File | null
  const mpAccessToken = formData.get('mpAccessToken') as string
  const mpPublicKey = formData.get('mpPublicKey') as string

  // Process slug to be url friendly
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')

  let logoUrl: string | undefined

  if (logoFile && logoFile.size > 0 && logoFile.name !== 'undefined') {
    const ext = logoFile.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${ext}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, logoFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(uploadData.path)
      logoUrl = publicUrlData.publicUrl
    } else {
      console.error("Upload error", uploadError)
      return { error: 'No se pudo subir la imagen.' }
    }
  }

  const updates: any = {
    full_name: fullName,
    slug: safeSlug,
    brand_color: brandColor,
    mp_access_token: mpAccessToken,
    mp_public_key: mpPublicKey,
  }

  if (logoUrl) {
    updates.logo_url = logoUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    console.error(error)
    return { error: 'Error al actualizar el perfil. Quizás este nombre de enlace ya está en uso.' }
  }

  revalidatePath('/dashboard', 'layout')
  revalidatePath(`/${safeSlug}`)
  
  return { success: true }
}

export async function updateAvailability(
  availability: { day_of_week: number, start_time: string, end_time: string }[],
  event_type_id?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
    return { error: 'No autorizado' }
  }

  // Delete existing availability for the user/event
  const { error: deleteError } = await supabase
    .from('availability')
    .delete()
    .match(event_type_id ? { user_id: user.id, event_type_id } : { user_id: user.id, event_type_id: null })

  if (deleteError) {
    console.error(deleteError)
    return { error: 'No se pudo actualizar la disponibilidad.' }
  }

  if (availability.length === 0) {
    revalidatePath('/dashboard/settings')
    return { success: true }
  }

  // Insert new availability
  const { error: insertError } = await supabase
    .from('availability')
    .insert(
      availability.map(a => ({
        ...a,
        user_id: user.id,
        event_type_id: event_type_id || null
      }))
    )

  if (insertError) {
    console.error(insertError)
    return { error: 'No se pudo actualizar la disponibilidad.' }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
