import { ReactNode } from 'react'
import Link from 'next/link'
import { Calendar, Settings, Clock, LogOut } from 'lucide-react'
import { logout } from '@/app/login/actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile to display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, slug, logo_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Calendar className="w-6 h-6" />
            <span>Turnos</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium">
            <Calendar className="w-5 h-5 text-slate-500" />
            Próximas Citas
          </Link>
          <Link href="/dashboard/event-types" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium">
            <Clock className="w-5 h-5 text-slate-500" />
            Tipos de Eventos
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-medium">
            <Settings className="w-5 h-5 text-slate-500" />
            Configuración
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
               {profile?.logo_url ? (
                 <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                   {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                 </div>
               )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name || 'Usuario'}</span>
              <span className="text-xs text-slate-500 truncate">{profile?.slug ? `/${profile.slug}` : user.email}</span>
            </div>
          </div>
          
          <form action={logout}>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors font-medium">
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Calendar className="w-6 h-6" />
            <span>Turnos</span>
          </div>
          {/* Mobile menu toggle would go here */}
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
