import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, ChevronRight } from 'lucide-react'

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

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      <div className="p-8 text-center border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Selecciona un tipo de reunión</h2>
        <p className="text-slate-500">¿Qué tipo de reunión te gustaría agendar con {profile.full_name}?</p>
      </div>

      <div className="flex flex-col">
        {(!eventTypes || eventTypes.length === 0) ? (
          <div className="p-12 text-center text-slate-500">
            Esta persona aún no ha configurado eventos disponibles.
          </div>
        ) : (
          eventTypes.map((event, index) => (
            <Link 
              href={`/${slug}/${event.id}`} 
              key={event.id}
              className={`p-6 group flex items-center justify-between hover:bg-slate-50 transition-colors ${index !== 0 ? 'border-t border-slate-100' : ''}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-3 h-3 rounded-full brand-bg shadow-sm"></div>
                   <h3 className="text-lg font-bold text-slate-900 group-hover:brand-text transition-colors">{event.title}</h3>
                </div>
                {event.description && (
                  <p className="text-slate-500 text-sm mb-3 pl-6 line-clamp-2">{event.description}</p>
                )}
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 pl-6">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {event.duration_mins} minutos
                </div>
              </div>

              <div className="text-slate-300 group-hover:brand-text transition-colors pl-4">
                <ChevronRight className="w-8 h-8" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
