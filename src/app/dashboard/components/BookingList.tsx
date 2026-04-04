'use client'

import { format, parseISO, isAfter, addMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Mail, Calendar, Clock, MoreHorizontal, CheckCircle, AlertCircle, Trash2, Edit } from 'lucide-react'
import { useState } from 'react'
import { cancelBooking, rescheduleBooking } from '../actions'

export function BookingList({ bookings }: { bookings: any[] }) {
  const [filter, setView] = useState<'all' | 'confirmed' | 'pending'>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleCancel = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.')) return
    
    setLoadingId(id)
    const res = await cancelBooking(id)
    if (res?.error) alert(res.error)
    setLoadingId(null)
  }

  const handleReschedule = async (id: string, currentStart: string, duration: number) => {
    const newStart = prompt('Ingresa la nueva fecha y hora (formato: YYYY-MM-DD HH:mm):', format(parseISO(currentStart), "yyyy-MM-dd HH:mm"))
    if (!newStart) return

    setLoadingId(id)
    try {
      const parsedDate = new Date(newStart)
      if (isNaN(parsedDate.getTime())) {
        alert('Formato de fecha inválido. Usa YYYY-MM-DD HH:mm')
        setLoadingId(null)
        return
      }
      const newEndTime = addMinutes(parsedDate, duration).toISOString()
      const res = await rescheduleBooking(id, parsedDate.toISOString(), newEndTime)
      if (res?.error) alert(res.error)
      else alert('Cita reprogramada con éxito')
    } catch (e) {
      alert('Error al procesar la fecha.')
    }
    setLoadingId(null)
  }

  const filteredBookings = bookings.filter(b => {
    if (filter === 'confirmed') return b.status === 'confirmed'
    if (filter === 'pending') return b.status === 'pending_payment'
    return true
  })

  // Sort: upcoming first
  const sorted = [...filteredBookings].sort((a, b) => 
    parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
  )

  const upcoming = sorted.filter(b => isAfter(parseISO(b.end_time), new Date()))

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setView('all')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setView('confirmed')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'confirmed' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Confirmados
        </button>
        <button 
          onClick={() => setView('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'pending' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Pendientes
        </button>
      </div>

      {upcoming.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No hay citas próximas</h3>
          <p className="text-slate-500 mt-1">Cuando los clientes reserven turnos, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {upcoming.map((booking) => (
            <div key={booking.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-6">
              
              {/* Header: Status & Actions */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-lg">{booking.booker_name}</h4>
                    {booking.status === 'confirmed' ? (
                      <span className="bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Confirmado
                      </span>
                    ) : (
                      <span className="bg-orange-50 text-orange-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-orange-100 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Pendiente Pago
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Mail className="w-4 h-4" />
                    <span>{booking.booker_email}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                   <button 
                     onClick={() => handleReschedule(booking.id, booking.start_time, booking.event_types?.duration_mins || 30)}
                     disabled={loadingId === booking.id}
                     className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50" 
                     title="Reprogramar"
                   >
                     <Edit className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={() => handleCancel(booking.id)}
                     disabled={loadingId === booking.id}
                     className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50" 
                     title="Cancelar"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evento</span>
                  <p className="text-sm font-semibold text-slate-700 truncate">{booking.event_types?.title}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horario</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{format(parseISO(booking.start_time), 'HH:mm')} ({booking.event_types?.duration_mins}m)</span>
                  </div>
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{format(parseISO(booking.start_time), "EEEE, d 'de' MMMM", { locale: es })}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
