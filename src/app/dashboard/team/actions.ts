'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTeam(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  // Restricción Ultra
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  if (profile?.plan_type !== 'ultra') {
    return { error: 'La creación de equipos es exclusiva para el plan Ultra' }
  }

  const teamName = formData.get('teamName') as string
  if (!teamName) return { error: 'El nombre del equipo es obligatorio' }

  const { error } = await supabase
    .from('teams')
    .insert({
      owner_id: user.id,
      name: teamName
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/team')
  return { success: true }
}

export async function addTeamMember(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  // Verificar plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  if (profile?.plan_type !== 'ultra') {
    return { error: 'Funcionalidad exclusiva para el plan Ultra' }
  }

  // Obtener el equipo del usuario
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!team) {
    return { error: 'No tienes un equipo creado' }
  }

  // Verificar límite de miembros (Max 5)
  const { count } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', team.id)

  if (count && count >= 5) {
    return { error: 'Has alcanzado el límite máximo de 5 miembros en tu equipo' }
  }

  const slug = (formData.get('slug') as string).trim()
  if (!slug) return { error: 'El identificador (slug) es obligatorio' }

  // Buscar el perfil por slug
  const { data: memberProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!memberProfile) {
    return { error: 'No se encontró ningún usuario con ese slug' }
  }

  // Verificar si ya es miembro
  const { data: existingMember } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', team.id)
    .eq('user_id', memberProfile.id)
    .single()

  if (existingMember) {
    return { error: 'Este usuario ya forma parte de tu equipo' }
  }

  // Agregar miembro al equipo
  const { error: insertError } = await supabase
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: memberProfile.id,
      role: 'member'
    })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath('/dashboard/team')
  return { success: true }
}

export async function removeTeamMember(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  const memberId = formData.get('memberId') as string
  if (!memberId) return { error: 'ID de miembro inválido' }

  // Verificar si el que borra es el owner
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!team) return { error: 'No tienes permisos de administrador para este equipo' }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', team.id)
    .eq('user_id', memberId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/team')
  return { success: true }
}
