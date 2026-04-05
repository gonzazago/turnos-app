'use client'

import { format, parseISO, isAfter, addMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { Mail, Calendar, Clock, CheckCircle, AlertCircle, Trash2, Edit, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { cancelBooking, rescheduleBooking } from '../actions'
import { Modal } from '@/components/Modal'
import { Spinner } from '@/components/ui/Spinner'

export function BookingList({ bookings }: { bookings: any[] }) {
  const [filter, setView] = useState<'all' | 'confirmed' | 'pending'>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  // Modal states
  const [bookingToCancel, setBookingToCancel] = useState<any | null>(null)
  const [bookingToReschedule, setBookingToReschedule] = useState<any | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')

  const handleCancel = async () => {
    if (!bookingToCancel) return
    const id = bookingToCancel.id
    setLoadingId(id)
    const res = await cancelBooking(id)
    if (res?.error) alert(res.error)
    setLoadingId(null)
    setBookingToCancel(null)
  }

  const openRescheduleModal = (booking: any) => {
    const date = parseISO(booking.start_time)
    setBookingToReschedule(booking)
    setRescheduleDate(format(date, 'yyyy-MM-dd'))
    setRescheduleTime(format(date, 'HH:mm'))
  }

  const handleReschedule = async () => {
    if (!bookingToReschedule) return
    const id = bookingToReschedule.id
    
    try {
      const newStart = new Date(`${rescheduleDate}T${rescheduleTime}`)
      if (isNaN(newStart.getTime())) {
        alert('Fecha u hora inválida')
        return
      }
      
      setLoadingId(id)
      const duration = bookingToReschedule.event_types?.duration_mins || 30
      const newEndTime = addMinutes(newStart, duration).toISOString()
      
      const res = await rescheduleBooking(id, newStart.toISOString(), newEndTime)
      if (res?.error) alert(res.error)
      
      setBookingToReschedule(null)
    } catch (e) {
      alert('Error al procesar la reprogramación')
    } finally {
      setLoadingId(null)
    }
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
                     onClick={() => openRescheduleModal(booking)}
                     disabled={loadingId === booking.id}
                     className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50" 
                     title="Reprogramar"
                   >
                     <Edit className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={() => setBookingToCancel(booking)}
                     disabled={loadingId === booking.id}
                     className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50" 
                     title="Cancelar"
                   >
                     {loadingId === booking.id ? <Spinner size="sm" /> : <Trash2 className="w-5 h-5" />}
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

      {/* Cancel Modal */}
      <Modal
        isOpen={!!bookingToCancel}
        onClose={() => setBookingToCancel(null)}
        title="Cancelar Cita"
        footer={
          <>
            <button 
              onClick={() => setBookingToCancel(null)}
              className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
            >
              No, volver
            </button>
            <button 
              onClick={handleCancel}
              disabled={loadingId === bookingToCancel?.id}
              className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center gap-2"
            >
              {loadingId === bookingToCancel?.id && <Spinner size="sm" color="white" />}
              Sí, cancelar cita
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-600">
              ¿Estás seguro de que deseas cancelar la cita de <strong>{bookingToCancel?.booker_name}</strong>?
            </p>
            <p className="text-slate-400 text-sm mt-2">Esta acción liberará el espacio en tu calendario y no se puede deshacer.</p>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!bookingToReschedule}
        onClose={() => setBookingToReschedule(null)}
        title="Reprogramar Cita"
        footer={
          <>
            <button 
              onClick={() => setBookingToReschedule(null)}
              className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={handleReschedule}
              disabled={loadingId === bookingToReschedule?.id}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              {loadingId === bookingToReschedule?.id && <Spinner size="sm" color="white" />}
              Guardar Cambios
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Nueva Fecha</label>
            <input 
              type="date" 
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Nueva Hora</label>
            <input 
              type="time" 
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <p className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
            La duración original del evento ({bookingToReschedule?.event_types?.duration_mins} min) se mantendrá.
          </p>
        </div>
      </Modal>
    </div>
  )
}
