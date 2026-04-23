'use client'

import { useState, useMemo } from 'react'
import { format, addDays, isSameDay, addMinutes, getDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Calendar as CalendarIcon, ArrowLeft, Mail, User, CheckCircle, CreditCard, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createBooking, rescheduleClientBooking } from './actions'
import { getAvailableSlots, Availability, Booking } from '@/utils/availability'
import { Spinner } from '@/components/Spinner'

interface Profile {
  id: string
  full_name: string
  slug: string
}

interface EventType {
  id: string
  title: string
  duration_mins: number
  description?: string
  requires_deposit: boolean
  total_price: number
  deposit_percentage: number
}

export function BookingClient({ 
  profile, 
  eventType, 
  bookedSlots = [], 
  availability = [],
  googleBusySlots = []
}: { 
  profile: Profile, 
  eventType: EventType, 
  bookedSlots?: Booking[],
  availability?: Availability[],
  googleBusySlots?: Booking[]
}) {
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Reschedule state
  const searchParams = useSearchParams()
  const rescheduleId = searchParams.get('rescheduleId')
  const rescheduleToken = searchParams.get('t')
  const [isEditMode, setIsEditMode] = useState(!!(rescheduleId && rescheduleToken))
  const [collisionData, setCollisionData] = useState<any>(null)

  const depositAmount = eventType.requires_deposit 
    ? ((eventType.total_price * eventType.deposit_percentage) / 100).toFixed(2)
    : null

  // Generate 14 working days for selection, starting from today
  const today = startOfDay(new Date())
  
  const workingDays = useMemo(() => {
    if (!availability || availability.length === 0) return [0, 1, 2, 3, 4, 5, 6]
    return Array.from(new Set(availability.map(a => a.day_of_week)))
  }, [availability])

  const days = useMemo(() => {
    const d: Date[] = []
    let current = today
    let maxLoops = 100 
    while (d.length < 14 && maxLoops > 0) {
      if (workingDays.includes(getDay(current))) {
        d.push(current)
      }
      current = addDays(current, 1)
      maxLoops--
    }
    return d
  }, [today, workingDays])

  const [selectedDate, setSelectedDate] = useState<Date>(days.length > 0 ? days[0] : today)

  // Generate slots for selected day
  const slots = getAvailableSlots(
    selectedDate,
    availability,
    bookedSlots,
    eventType.duration_mins,
    googleBusySlots
  )
  const handleBooking = async (e: React.FormEvent<HTMLFormElement>, forceCreate = false) => {
    if (e) e.preventDefault()
    if (!selectedTime) return

    setIsSubmitting(true)
    setError(null)
    
    const startTimeStr = selectedTime.toISOString()
    const endTimeStr = addMinutes(selectedTime, eventType.duration_mins).toISOString()

    if (isEditMode && rescheduleId && rescheduleToken) {
      const res = await rescheduleClientBooking(rescheduleId, rescheduleToken, startTimeStr, endTimeStr)
      if (res?.error) {
        setIsSubmitting(false)
        setError(res.error)
      } else {
        setIsSubmitting(false)
        setIsSuccess(true)
      }
      return
    }

    const formData = new FormData(e?.currentTarget || undefined)
    
    // add hidden fields
    formData.append('profileId', profile.id)
    formData.append('slug', profile.slug)
    formData.append('eventId', eventType.id)
    formData.append('startTime', startTimeStr)
    formData.append('endTime', endTimeStr)
    if (forceCreate) formData.append('forceCreate', 'true')

    const res = await createBooking(formData)
    
    if (res?.requiresRescheduleConsent) {
      setIsSubmitting(false)
      setCollisionData(res)
    } else if (res?.error) {
       setIsSubmitting(false)
       setError(res.error)
    } else if (res?.checkoutUrl) {
       // Show redirecting modal
       setIsRedirecting(true)
       // Small delay so user can read the modal
       setTimeout(() => {
         window.location.href = res.checkoutUrl!
       }, 2000)
    } else {
       setIsSubmitting(false)
       setIsSuccess(true)
    }
  }

  const handleRescheduleExisting = async () => {
    if (!collisionData || !selectedTime) return
    setIsSubmitting(true)
    
    // We need the token for the existing booking to reschedule it
    // But we don't have it here. The plan was to redirect to edit mode or call a specific action.
    // Let's use the rescheduleClientBookingByEmail approach if we had the token, 
    // or better, since this is the same user, we can trust the flow if we verify it.
    // For now, let's redirect to edit mode which is safer as it uses the token.
    
    // Actually, I'll update the action to return the token too if it's the same email.
    // (I'll do that in a separate step to keep it clean)
    // For now, let's show the warning and allow them to "force" or "cancel".
  }

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-12 text-center max-w-xl mx-auto flex flex-col items-center">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          {isEditMode ? '¡Reserva reprogramada!' : '¡Reserva confirmada!'}
        </h2>
        <p className="text-slate-600 mb-8">
          {isEditMode 
            ? `Tu reserva con ${profile.full_name} ha sido reprogramada para el ${selectedTime && format(selectedTime, "d 'de' MMMM 'a las' HH:mm", { locale: es })}.`
            : `Has agendado exitosamente una reunión de ${eventType.duration_mins} minutos con ${profile.full_name} para el ${selectedTime && format(selectedTime, "d 'de' MMMM 'a las' HH:mm", { locale: es })}.`
          }
        </p>
        <Link href={`/${profile.slug}`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-full transition-colors inline-block">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-5xl mx-auto flex flex-col md:flex-row">
      
      {/* Collision / Reschedule Modal */}
      {collisionData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">Ya tienes una reserva</h3>
            <p className="text-slate-600 mb-6 text-center">
              Hemos detectado que ya tienes un turno agendado (<strong>{collisionData.existingBookingTitle}</strong>) para el <strong>{format(new Date(collisionData.existingBookingDate), "d 'de' MMMM 'a las' HH:mm", { locale: es })}</strong>.
              <br /><br />
              ¿Qué deseas hacer?
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  const id = collisionData.existingBookingId;
                  const token = collisionData.existingBookingToken;
                  const startTimeStr = selectedTime?.toISOString();
                  const endTimeStr = addMinutes(selectedTime!, eventType.duration_mins).toISOString();
                  
                  setIsSubmitting(true);
                  setCollisionData(null);
                  setIsEditMode(true); // Mark as edit mode for the success message
                  
                  const res = await rescheduleClientBooking(id, token, startTimeStr!, endTimeStr);
                  if (res?.error) {
                    setIsSubmitting(false);
                    setError(res.error);
                  } else {
                    setIsSubmitting(false);
                    setIsSuccess(true);
                  }
                }}
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cambiar por este nuevo horario
              </button>
              
              <button
                onClick={() => setCollisionData(null)}
                className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Mantener mi turno actual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redirection Modal */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-slate-50 brand-text rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
              <CreditCard className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Casi listo!</h3>
            <p className="text-slate-600 mb-6">
              Serás redirigido a <strong>Mercado Pago</strong> para completar el pago de la seña y confirmar tu reserva con {profile.full_name}.
            </p>
            <div className="flex items-center justify-center gap-2 brand-text font-bold text-sm uppercase tracking-widest">
              <span className="w-2 h-2 brand-bg rounded-full animate-bounce"></span>
              <span className="w-2 h-2 brand-bg rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 brand-bg rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Info */}
      <div className="bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-5 sm:p-8 w-full md:w-1/3">
        <Link href={`/${profile.slug}`} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm transition-all mb-6 md:mb-8">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <p className="text-slate-500 font-medium mb-1">{profile.full_name}</p>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">{eventType.title}</h2>
        
        <div className="flex flex-col gap-4 text-slate-600 font-medium">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <span>{eventType.duration_mins} minutos</span>
          </div>
          {eventType.requires_deposit && (
            <div className="flex items-center gap-3 brand-text">
              <CreditCard className="w-5 h-5" />
              <span>Requiere seña de ${depositAmount}</span>
            </div>
          )}
          {eventType.description && (
             <p className="text-slate-500 text-sm mt-4 leading-relaxed font-normal">{eventType.description}</p>
          )}
        </div>
      </div>

      {/* Booking Form Area */}
      <div className="p-5 sm:p-8 w-full md:w-2/3">
         {!selectedTime ? (
           <>
             <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6">Selecciona una fecha y hora</h3>
             
             {/* Date Picker (Horizontal scroll) */}
             <div className="flex overflow-x-auto pb-4 mb-6 gap-3 no-scrollbar scroll-smooth">
               {days.map((day) => {
                 const isSelected = isSameDay(day, selectedDate)
                 return (
                   <button
                     key={day.toISOString()}
                     onClick={() => setSelectedDate(day)}
                     className={`flex flex-col items-center min-w-[80px] p-4 rounded-2xl border transition-all ${
                       isSelected 
                         ? 'brand-bg-contrast shadow-md transform scale-105' 
                         : 'border-slate-200 text-slate-700 hover-brand-action'
                     }`}
                   >
                     <span className={`text-xs font-bold uppercase ${isSelected ? 'opacity-90' : 'text-slate-500'}`}>
                       {format(day, 'MMM', { locale: es })}
                     </span>
                     <span className="text-2xl font-bold my-1">
                       {format(day, 'd')}
                     </span>
                     <span className={`text-xs font-medium ${isSelected ? 'opacity-90' : 'text-slate-400'}`}>
                       {format(day, 'EEE', { locale: es })}
                     </span>
                   </button>
                 )
               })}
             </div>

             <h4 className="font-semibold text-slate-700 mb-4">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}</h4>
             
             {eventType.requires_deposit && (
               <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                 <CreditCard className="w-5 h-5 brand-text mt-0.5" />
                 <div>
                   <p className="text-sm font-bold text-slate-900">Esta reserva requiere una seña</p>
                   <p className="text-xs text-slate-600 mt-0.5">Deberás abonar ${depositAmount} para confirmar tu turno. El resto (${(eventType.total_price - parseFloat(depositAmount!)).toFixed(2)}) se abona al momento de la cita.</p>
                 </div>
               </div>
             )}

             <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
               {slots.length > 0 ? (
                 slots.map((slotIso) => {
                   const date = new Date(slotIso)
                   return (
                     <button
                       key={slotIso}
                       onClick={() => setSelectedTime(date)}
                       className="py-3 px-2 border font-bold rounded-xl transition-all border-slate-200 bg-slate-50 brand-text hover-brand-action"
                     >
                       {format(date, 'HH:mm')}
                     </button>
                   )
                 })
               ) : (
                 <p className="col-span-full text-center text-slate-400 py-8 italic">
                   No hay horarios disponibles para este día.
                 </p>
               )}
             </div>
           </>
         ) : (
           <form onSubmit={handleBooking} className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-bold text-slate-900">Confirma tu reserva</h3>
               <button 
                 type="button" 
                 onClick={() => setSelectedTime(null)}
                 className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
               >
                 Cambiar hora
               </button>
             </div>

             <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 flex items-center gap-3 text-slate-700 font-medium">
                <CalendarIcon className="w-5 h-5 brand-text" />
                <span>{format(selectedTime, "EEEE, d 'de' MMMM, HH:mm", { locale: es })}</span>
             </div>

             {eventType.requires_deposit && (
               <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                 <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Resumen de Pago</h4>
                 <div className="flex flex-col gap-3">
                   <div className="flex justify-between text-slate-600">
                     <span>Precio Total</span>
                     <span>${Number(eventType.total_price).toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center py-3 border-t border-slate-200 brand-text font-bold">
                     <div className="flex flex-col">
                       <span>Abonar ahora (Seña {eventType.deposit_percentage}%)</span>
                       <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">Vía Mercado Pago</span>
                     </div>
                     <span className="text-xl">${depositAmount}</span>
                   </div>
                 </div>
               </div>
             )}

             {error && (
               <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 font-medium text-sm">
                 {error}
               </div>
             )}

             <div className="flex flex-col gap-6">
               <div className="flex flex-col gap-2">
                 <label htmlFor="name" className="text-sm font-bold text-slate-700">Tu nombre</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <User className="h-5 w-5 text-slate-400" />
                   </div>
                   <input type="text" id="name" name="name" required className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:brand-ring focus:ring-2 focus:outline-none transition-shadow" placeholder="Ej. Ana Gómez" />
                 </div>
               </div>

               <div className="flex flex-col gap-2">
                 <label htmlFor="email" className="text-sm font-bold text-slate-700">Tu email</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Mail className="h-5 w-5 text-slate-400" />
                   </div>
                   <input type="email" id="email" name="email" required className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:brand-ring focus:ring-2 focus:outline-none transition-shadow" placeholder="ana@ejemplo.com" />
                 </div>
               </div>
             </div>

             <button 
               type="submit" 
               disabled={isSubmitting}
               className="mt-8 w-full brand-bg-contrast hover:opacity-90 font-bold text-lg py-4 rounded-xl transition-all shadow-lg active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
             >
               {isSubmitting && <Spinner size="sm" color="white" />}
               {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
             </button>
           </form>
         )}
      </div>
    </div>
  )
}
