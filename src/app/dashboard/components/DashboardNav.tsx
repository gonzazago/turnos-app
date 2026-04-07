'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'
import { logout } from '@/app/login/actions'

interface Profile {
  full_name: string | null
  slug: string | null
  logo_url: string | null
}

export interface NavLinkDef {
  href: string
  label: string
  iconName: string // pasamos un string para el lucide icon
}

interface DashboardNavProps {
  profile: Profile | null
  userEmail: string | undefined
  navLinks: NavLinkDef[]
}

// Map strings a iconos para evitar pasar componentes por props en Server-Client boundary
import { Calendar, Settings, Clock, Users, Package } from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  Calendar,
  Clock,
  Package,
  Users,
  Settings
}

export function DashboardNav({ profile, userEmail, navLinks }: DashboardNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const NavContent = () => (
    <>
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navLinks.map((link) => {
          const Icon = ICON_MAP[link.iconName] || Calendar
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              {link.label}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
             {profile?.logo_url ? (
               <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                 {profile?.full_name?.charAt(0) || userEmail?.charAt(0)}
               </div>
             )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name || 'Usuario'}</span>
            <span className="text-xs text-slate-500 truncate">{profile?.slug ? `/${profile.slug}` : userEmail}</span>
          </div>
        </div>
        
        <form action={logout}>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors font-medium text-left">
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Calendar className="w-6 h-6" />
            <span>Turnos</span>
          </Link>
        </div>
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Calendar className="w-6 h-6" />
          <span>Turnos</span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-16 left-0 bottom-0 w-72 bg-white z-50 md:hidden transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col border-r border-slate-200`}>
        <NavContent />
      </div>
    </>
  )
}
