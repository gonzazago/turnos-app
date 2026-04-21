import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { deletePackage } from './actions'
import { Package, Trash2, CalendarDays, RefreshCw, Info } from 'lucide-react'
import { PackageForm } from './PackageForm'

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
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Columna Izquierda: Formulario y Explicación */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 mt-4 md:mt-0 flex items-center gap-3">
            <Package className="w-8 h-8 text-slate-400" />
            Venta de Paquetes
          </h1>
          <p className="text-slate-500">Crea promociones para que tus clientes aseguren su continuidad pagando Múltiples Sesiones por adelantado.</p>
        </div>

        <PackageForm eventTypes={eventTypes as any} />
      </div>

      {/* Columna Derecha: Listado de Paquetes */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6 pt-4 lg:pt-14">
        {packages?.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-64">
             <Package className="w-12 h-12 text-slate-300 mb-4" />
             <h3 className="text-lg font-bold text-slate-900 mb-1">Aún no tienes paquetes activos</h3>
             <p className="text-slate-500 text-sm max-w-sm">Crea tu primer paquete a la izquierda para que comience a aparecer en tu link público.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages?.map(pkg => (
              <div key={pkg.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-900 text-lg pr-4">{pkg.name}</h3>
                  <div className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full text-xs whitespace-nowrap">
                    ${pkg.total_price}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-6 text-sm text-slate-600 flex-1">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{pkg.session_count} sesiones</span> 
                    {pkg.event_types?.title ? ` de ${pkg.event_types.title}` : ' globales'}
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                    <span>Modalidad: <strong className="text-slate-900">{pkg.scheduling_type === 'libre' ? 'Créditos Libres' : 'Recurrente Semanal'}</strong></span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-between items-center mt-auto">
                   <span className="text-xs text-slate-400 font-medium font-mono">ID: {pkg.id.slice(0,8)}</span>
                   <form action={deletePackage as any}>
                     <input type="hidden" name="packageId" value={pkg.id} />
                     <button type="submit" className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors group" title="Eliminar Paquete">
                       <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                     </button>
                   </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
