'use client'

import { format, parseISO, isAfter, addMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { Mail, Calendar, Clock, Trash2, Edit, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { cancelBooking, rescheduleBooking } from '../actions'
import { Modal } from '@/components/Modal'
import { Spinner } from '@/components/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function BookingList({ bookings }: { bookings: any[] }) {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all')
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
        {(['all', 'confirmed', 'pending'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === tab 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'all' ? 'Todos' : tab === 'confirmed' ? 'Confirmados' : 'Pendientes'}
          </button>
        ))}
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
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              isLoading={loadingId === booking.id}
              onReschedule={() => openRescheduleModal(booking)}
              onCancel={() => setBookingToCancel(booking)}
            />
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
            <Button variant="ghost" onClick={() => setBookingToCancel(null)}>
              No, volver
            </Button>
            <Button 
              variant="danger" 
              onClick={handleCancel}
              isLoading={loadingId === bookingToCancel?.id}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Sí, cancelar cita
            </Button>
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
            <Button variant="ghost" onClick={() => setBookingToReschedule(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleReschedule}
              isLoading={loadingId === bookingToReschedule?.id}
            >
              Guardar Cambios
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-6">
          <Input 
            label="Nueva Fecha"
            type="date" 
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
          />
          <Input 
            label="Nueva Hora"
            type="time" 
            value={rescheduleTime}
            onChange={(e) => setRescheduleTime(e.target.value)}
          />
          <p className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
            La duración original del evento ({bookingToReschedule?.event_types?.duration_mins} min) se mantendrá.
          </p>
        </div>
      </Modal>
    </div>
  )
}

function BookingCard({ 
  booking, 
  isLoading, 
  onReschedule, 
  onCancel 
}: { 
  booking: any, 
  isLoading: boolean,
  onReschedule: () => void,
  onCancel: () => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-lg">{booking.booker_name}</h4>
            <StatusBadge type={booking.status === 'confirmed' ? 'success' : 'warning'}>
              {booking.status === 'confirmed' ? 'Confirmado' : 'Pendiente Pago'}
            </StatusBadge>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Mail className="w-4 h-4" />
            <span>{booking.booker_email}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
           <Button 
             variant="ghost" 
             size="sm"
             onClick={onReschedule}
             disabled={isLoading}
             title="Reprogramar"
           >
             <Edit className="w-5 h-5" />
           </Button>
           <Button 
             variant="ghost" 
             size="sm"
             onClick={onCancel}
             isLoading={isLoading}
             className="text-slate-400 hover:text-red-600 hover:bg-red-50"
             title="Cancelar"
           >
             <Trash2 className="w-5 h-5" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
        <DetailItem label="Evento" value={booking.event_types?.title} />
        <DetailItem 
          label="Horario" 
          value={`${format(parseISO(booking.start_time), 'HH:mm')} (${booking.event_types?.duration_mins}m)`} 
          icon={<Clock className="w-3.5 h-3.5 text-slate-400" />}
        />
        <DetailItem 
          label="Fecha" 
          value={format(parseISO(booking.start_time), "EEEE, d 'de' MMMM", { locale: es })} 
          icon={<Calendar className="w-3.5 h-3.5 text-slate-400" />}
          className="col-span-2"
        />
      </div>
    </div>
  )
}

function DetailItem({ label, value, icon, className = '' }: { label: string, value: string, icon?: React.ReactNode, className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        {icon}
        <p className="truncate">{value}</p>
      </div>
    </div>
  )
}
