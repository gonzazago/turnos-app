'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getOnboardingStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('has_completed_onboarding')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching onboarding status:', error)
    return { error: 'No se pudo obtener el estado de onboarding.' }
  }

  return { hasCompletedOnboarding: !!data?.has_completed_onboarding }
}

export async function completeOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ has_completed_onboarding: true })
    .eq('id', user.id)

  if (error) {
    console.error('Error completing onboarding:', error)
    return { error: 'No se pudo actualizar el estado de onboarding.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
