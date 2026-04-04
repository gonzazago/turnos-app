import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './SettingsClient'

export const metadata = { title: 'Configuración - Turnos' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, payment_accounts(*)')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Ajustes</h1>
      
      <div className="flex flex-col gap-8">
        <SettingsForm profile={profile || {}} />
      </div>
    </div>
  )
}
