import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EventFormModal } from './EventFormModal'
import { Clock, Trash2 } from 'lucide-react'
import { deleteEventType } from './actions'

export const metadata = { title: 'Tipos de Eventos - Turnos' }

export default async function EventTypesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('*, availability(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const getDaysSummary = (availability: any[]) => {
    if (!availability || availability.length === 0) return 'Sin horario definido'
    
    // Sort by day_of_week
    const sorted = [...availability].sort((a, b) => a.day_of_week - b.day_of_week)
    
    // Map to labels
    return sorted.map(a => DAYS[a.day_of_week]).join(', ')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('slug')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tipos de Eventos</h1>
          <p className="text-slate-500 mt-1">Configura las reuniones que la gente puede agendar contigo.</p>
        </div>
      </div>

      <EventFormModal />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eventTypes?.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No tienes eventos creados</h3>
            <p className="text-slate-500">Crea tu primer tipo de evento para permitir que otros agenden reuniones contigo.</p>
          </div>
        ) : (
          eventTypes?.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                
                <div className="flex items-center gap-1">
                  <EventFormModal eventToEdit={event} />

                  <form action={async () => {
                    "use server"
                    await deleteEventType(event.id)
                  }}>
                    <button className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100" title="Eliminar evento">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>{event.duration_mins} minutos</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {getDaysSummary(event.availability)}
                  </span>
                </div>
              </div>
              
              {event.description && (
                <p className="text-slate-600 text-sm line-clamp-2 mb-6">{event.description}</p>
              )}
              
              <div className="mt-auto pt-4 border-t border-slate-100">
                <a 
                  href={profile?.slug ? `/${profile.slug}/${event.id}` : '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors inline-flex items-center gap-1.5"
                >
                  Ver página de reserva →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
