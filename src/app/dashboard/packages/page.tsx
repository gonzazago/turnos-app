import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { deletePackage } from './actions'
import { Package, Trash2, CalendarDays, RefreshCw, Info, Clock, CheckCircle2 } from 'lucide-react'
import { PackageFormModal } from './PackageFormModal'

const DAYS_LABELS: Record<number, string> = {
  1: 'Lu', 2: 'Ma', 3: 'Mi', 4: 'Ju', 5: 'Vi', 6: 'Sa', 0: 'Do'
}

export default async function PackagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch Profile for Gatekeeping
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  if (profile?.plan_type === 'free') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col max-w-2xl mx-auto mt-12">
        <div className="h-32 bg-slate-900 border-b border-slate-200 flex items-center justify-center">
            <Package className="w-12 h-12 text-slate-100" />
        </div>
        <div className="p-8 text-center text-slate-600">
           <h2 className="text-2xl font-bold text-slate-900 mb-4">Múltiples Sesiones, Mejor Retención</h2>
           <p className="mb-6 leading-relaxed">
             La funcionalidad de Paquetes te permite cobrar por adelantado un set de turnos. Tus clientes podrán comprar bonos de múltiples reuniones, agendarlas de una sola vez de forma recurrente o administrarlas como créditos a su favor.
           </p>
           <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl mb-8 flex gap-3 text-left">
             <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
             <p className="text-sm text-yellow-800 font-medium">Esta función comercial está reservada para usuarios con suscripción Pro o Ultra.</p>
           </div>
           <button disabled className="bg-slate-200 text-slate-400 font-bold px-8 py-3 rounded-xl cursor-not-allowed w-full">Mejorar Plan</button>
        </div>
      </div>
    )
  }

  // 2. Fetch required data: EventTypes and Packages
  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('id, title')
    .eq('user_id', user.id)

  const { data: packages } = await supabase
    .from('session_packages')
    .select('*, event_types(title)')
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Venta de Paquetes
          </h1>
          <p className="text-slate-500">Crea promociones para que tus clientes aseguren su continuidad pagando por adelantado.</p>
        </div>

        <PackageFormModal eventTypes={eventTypes as any} />
      </div>

      {/* Listado de Paquetes */}
      <div className="flex flex-col gap-6">
        {packages?.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes paquetes activos</h3>
             <p className="text-slate-500 max-w-sm mb-8">Comienza creando tu primera promoción para que aparezca en tu perfil público.</p>
             <PackageFormModal eventTypes={eventTypes as any} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages?.map(pkg => (
              <div key={pkg.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-xl mb-1">{pkg.name}</h3>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                       {pkg.scheduling_type === 'libre' ? 'Créditos Libres' : 'Agendamiento Fijo'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <PackageFormModal eventTypes={eventTypes as any} packageToEdit={pkg} />
                    <form action={deletePackage as any}>
                      <input type="hidden" name="packageId" value={pkg.id} />
                      <button type="submit" className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors group" title="Eliminar Paquete">
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-6 flex-1">
                  <div className="flex flex-wrap gap-2">
                    {pkg.variants?.map((v: any, i: number) => (
                      <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 flex items-center gap-2">
                         <span className="text-sm font-bold text-slate-900">${v.price}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase">{v.session_count} ses.</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{pkg.event_types?.title || 'Global'}</span>
                    </div>
                    {pkg.scheduling_type === 'fijo' && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <RefreshCw className="w-4 h-4 text-slate-400" />
                        <span>{pkg.frequency_per_week}x semana</span>
                      </div>
                    )}
                  </div>

                  {pkg.scheduling_type === 'fijo' && pkg.allowed_days?.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                       <CalendarDays className="w-4 h-4 text-slate-400" />
                       <div className="flex gap-1">
                          {[1,2,3,4,5,6,0].map(d => (
                            <span key={d} className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-md ${pkg.allowed_days?.includes(d) ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-300'}`}>
                              {DAYS_LABELS[d]}
                            </span>
                          ))}
                       </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-between items-center mt-auto">
                   <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      Activo para reserva
                   </div>
                   <span className="text-[10px] text-slate-300 font-mono">#{pkg.id.slice(0,8)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
