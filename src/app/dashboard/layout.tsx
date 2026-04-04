import { ReactNode } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from './components/DashboardNav'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, slug, logo_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <DashboardNav profile={profile} userEmail={user.email} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 p-4 md:p-8 mt-16 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
