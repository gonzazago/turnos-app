import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './SettingsClient'
import { AvailabilityForm } from './AvailabilityForm'

export const metadata = { title: 'Configuración - Turnos' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [profileResult, availabilityResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('availability')
      .select('*')
      .eq('user_id', user.id)
      .order('day_of_week', { ascending: true })
  ])

  const profile = profileResult.data
  const availability = availabilityResult.data || []

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Ajustes</h1>
      
      <div className="flex flex-col gap-8">
        <SettingsForm profile={profile || {}} />
        <AvailabilityForm initialAvailability={availability} />
      </div>
    </div>
  )
}
