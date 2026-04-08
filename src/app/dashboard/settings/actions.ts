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
  const brandPalette = formData.get('brandPalette') as string
  const fontFamily = formData.get('fontFamily') as string
  const customSuccessMsg = formData.get('customSuccessMsg') as string
  const customEmailBody = formData.get('customEmailBody') as string
  const refundRules = formData.get('refundRules') as string

  const logoFile = formData.get('logo') as File | null
  const bannerFile = formData.get('banner') as File | null
  const faviconFile = formData.get('favicon') as File | null

  // Process slug to be url friendly
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')

  const uploadFile = async (file: File | null, bucket: string) => {
    if (file && file.size > 0 && file.name !== 'undefined') {
      const ext = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (!uploadError && uploadData) {
        return supabase.storage.from(bucket).getPublicUrl(uploadData.path).data.publicUrl
      }
    }
    return undefined;
  }

  const logoUrl = await uploadFile(logoFile, 'logos')
  const bannerUrl = await uploadFile(bannerFile, 'banners')
  const faviconUrl = await uploadFile(faviconFile, 'favicons')

  const updates: any = {
    full_name: fullName,
    slug: safeSlug,
    brand_color: brandColor,
    font_family: fontFamily || 'Inter',
    custom_success_msg: customSuccessMsg || null,
    custom_email_body: customEmailBody || null,
  }

  if (brandPalette) {
    try {
      updates.brand_palette = JSON.parse(brandPalette)
    } catch (e) {}
  }

  if (refundRules) {
    try {
      updates.refund_rules = JSON.parse(refundRules)
    } catch (e) {}
  }

  if (logoUrl) updates.logo_url = logoUrl
  if (bannerUrl) updates.banner_url = bannerUrl
  if (faviconUrl) updates.favicon_url = faviconUrl

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
