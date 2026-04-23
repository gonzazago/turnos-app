import { ReactNode } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from './components/DashboardNav'
import { GuidedTour } from './components/GuidedTour'
import { Suspense } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, slug, logo_url, plan_type')
    .eq('id', user.id)
    .single()

  const navLinks = [
    { href: '/dashboard', label: 'Próximas Citas', iconName: 'Calendar' },
    { href: '/dashboard/event-types', label: 'Tipos de Eventos', iconName: 'Clock' }
  ]

  // Upselling o Condicional BDD
  if (profile?.plan_type === 'pro' || profile?.plan_type === 'ultra') {
    navLinks.push({ href: '/dashboard/packages', label: 'Paquetes Especiales', iconName: 'Package' })
  }
  
  if (profile?.plan_type === 'ultra') {
    navLinks.push({ href: '/dashboard/team', label: 'Equipos', iconName: 'Users' })
  }

  // Settings available for all
  navLinks.push({ href: '/dashboard/settings', label: 'Configuración', iconName: 'Settings' })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <DashboardNav profile={profile} userEmail={user.email} navLinks={navLinks} />

      <Suspense fallback={null}>
        <GuidedTour />
      </Suspense>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 p-4 md:p-8 mt-14 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
