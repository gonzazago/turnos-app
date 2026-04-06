'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarService } from '@/services/calendar/service'

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
    // Note: mp_access_token is now handled by PaymentService and stored in payment_accounts
  }

  if (logoUrl) {
    updates.logo_url = logoUrl
  }

  // Use update instead of upsert since the user ID already exists in auth.users
  // and RLS policies are set for update on profiles.
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    
    // Check for unique constraint violation on slug
    if (error.code === '23505') {
      return { error: 'Este nombre de enlace (slug) ya está en uso por otro usuario. Por favor elige uno diferente.' }
    }
    
    return { error: `Error al actualizar el perfil: ${error.message}` }
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

export async function disconnectPaymentAccount(provider: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
    return { error: 'No autorizado' }
  }

  if (provider === 'google') {
    // 0. Stop the webhook
    await CalendarService.stopWebhook(user.id);

    // 1. Delete the google calendar tokens
    const { error: tokenError } = await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', user.id)

    if (tokenError) {
      console.error('Error disconnecting Google Calendar tokens:', tokenError)
      return { error: 'No se pudo desvincular Google Calendar.' }
    }

    // 2. Update profile flag
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ google_calendar_connected: false })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error updating profile after Google disconnection:', profileError)
      return { error: 'Error al actualizar el perfil.' }
    }
  } else {
    // Delete the payment account record for this provider (e.g., mercadopago)
    const { error } = await supabase
      .from('payment_accounts')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider)

    if (error) {
      console.error('Error disconnecting payment account:', error)
      return { error: 'No se pudo desvincular la cuenta.' }
    }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
