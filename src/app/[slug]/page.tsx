import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, ChevronRight, Package, CalendarDays } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('slug', slug)
    .single()

  if (!profile) return { title: 'No encontrado' }

  return { title: `Agenda con ${profile.full_name}`, description: 'Selecciona una reunión para agendar un turno.' }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, brand_color')
    .eq('slug', slug)
    .single()

  if (!profile) {
    notFound()
  }

  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('*')
    .eq('user_id', profile.id)
    .order('duration_mins', { ascending: true })

  const { data: packages } = await supabase
    .from('session_packages')
    .select('*')
    .eq('provider_id', profile.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Sección 1: Eventos Individuales */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-lg sm:shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 text-center border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Selecciona un tipo de reunión</h2>
          <p className="text-sm sm:text-base text-slate-500">¿Qué tipo de reunión te gustaría agendar con {profile.full_name}?</p>
        </div>

        <div className="flex flex-col">
          {(!eventTypes || eventTypes.length === 0) ? (
            <div className="p-8 sm:p-12 text-center text-slate-500">
              Esta persona aún no ha configurado eventos disponibles.
            </div>
          ) : (
            eventTypes.map((event, index) => (
              <Link 
                href={`/${slug}/${event.id}`} 
                key={event.id}
                className={`p-5 sm:p-6 group flex items-center justify-between hover:bg-slate-50 transition-colors ${index !== 0 ? 'border-t border-slate-100' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                     <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full brand-bg shadow-sm"></div>
                     <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:brand-text transition-colors">{event.title}</h3>
                  </div>
                  {event.description && (
                    <p className="text-slate-500 text-xs sm:text-sm mb-2 sm:mb-3 pl-4 sm:pl-6 line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 pl-4 sm:pl-6">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                    {event.duration_mins} minutos
                  </div>
                </div>

                <div className="text-slate-300 group-hover:brand-text transition-colors pl-2 sm:pl-4">
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Sección 2: Paquetes */}
      {packages && packages.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-lg sm:shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 text-center border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Paquetes y Promociones</h2>
            <p className="text-sm sm:text-base text-slate-500">Adquiere bonos de múltiples reuniones para agendar con {profile.full_name}.</p>
          </div>
          
          <div className="flex flex-col">
            {packages.map((pkg, index) => (
              <Link 
                href={`/${slug}/package/${pkg.id}`} 
                key={pkg.id}
                className={`p-5 sm:p-6 group flex items-center justify-between hover:bg-slate-50 transition-colors ${index !== 0 ? 'border-t border-slate-100' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                     <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 shadow-sm group-hover:brand-bg transition-colors"></div>
                     <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:brand-text transition-colors">{pkg.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-slate-600 pl-4 sm:pl-6">
                    <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:brand-text" /> {pkg.session_count} sesiones</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] sm:text-xs brand-bg-contrast">${pkg.total_price}</span>
                  </div>
                </div>
                <div className="text-slate-300 group-hover:brand-text transition-colors pl-2 sm:pl-4 flex flex-col items-center">
                  <span className="text-[8px] sm:text-[10px] font-bold mb-0.5 sm:mb-1 uppercase tracking-wider">{pkg.scheduling_type === 'libre' ? 'Libre' : 'Fijo'}</span>
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
