'use client'

import { useState } from 'react'
import { format, addDays, startOfDay, addMinutes, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, ArrowLeft, Mail, User, CheckCircle, CreditCard, Clock } from 'lucide-react'
import Link from 'next/link'
import { purchasePackage } from './actions'
import { getAvailableSlots, Availability, Booking } from '@/utils/availability'
import { Spinner } from '@/components/Spinner'

export function PackageClient({ 
  profile, 
  pkg, 
  availability = [],
  bookedSlots = [],
  googleBusySlots = []
}: { 
  profile: any, 
  pkg: any, 
  availability?: Availability[],
  bookedSlots?: Booking[],
  googleBusySlots?: Booking[]
}) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFijo = pkg.scheduling_type === 'fijo'
  const durationMins = pkg.event_types?.duration_mins || 60

  // Calendar logic for 'fijo'
  const today = startOfDay(new Date())
  const days = Array.from({ length: 14 }).map((_, i) => addDays(today, i))
  const slots = isFijo ? getAvailableSlots(
    selectedDate,
    availability,
    bookedSlots,
    durationMins,
    googleBusySlots
  ) : []

  const handlePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isFijo && !selectedTime) return

    setIsSubmitting(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    // add hidden fields
    formData.append('profileId', profile.id)
    formData.append('packageId', pkg.id)
    if (isFijo && selectedTime) {
      formData.append('startTime', selectedTime.toISOString())
      formData.append('durationMins', durationMins.toString())
    }

    const res = await purchasePackage(formData)
    
    if (res?.error) {
       setIsSubmitting(false)
       setError(res.error)
    } else if (res?.checkoutUrl) {
       setIsRedirecting(true)
       setTimeout(() => {
         window.location.href = res.checkoutUrl!
       }, 1500)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-5xl mx-auto flex flex-col md:flex-row">
      
      {/* Redirection Modal */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-slate-50 brand-text rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
              <CreditCard className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Completar Pago!</h3>
            <p className="text-slate-600 mb-6">
              Serás redirigido a <strong>Mercado Pago</strong> para finalizar la compra de tu paquete de {pkg.session_count} sesiones.
            </p>
          </div>
        </div>
      )}

      {/* Sidebar Info */}
      <div className="bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-8 w-full md:w-1/3 flex flex-col">
        <Link href={`/${profile.slug}`} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm transition-all mb-8">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <p className="text-slate-500 font-medium mb-1">Comprando a {profile.full_name}</p>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{pkg.name}</h2>
        
        <div className="flex flex-col gap-4 text-slate-600 font-medium mb-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-slate-400" />
            <span>Paquete de {pkg.session_count} Sesiones</span>
          </div>
          {pkg.event_types && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <span>{pkg.event_types.title} ({pkg.event_types.duration_mins}m)</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-200">
          <p className="text-slate-500 text-sm mb-1">Total a pagar</p>
          <p className="text-3xl font-bold text-slate-900">${pkg.total_price}</p>
          {isFijo ? (
            <p className="text-xs text-slate-500 mt-2">Al pagar, se reservarán de forma automática {pkg.session_count} turnos semanales a partir de la fecha seleccionada.</p>
          ) : (
            <p className="text-xs text-slate-500 mt-2">Al pagar, obtendrás {pkg.session_count} créditos a tu favor para usar cuando desees.</p>
          )}
        </div>
      </div>

      {/* Main Content (Selection & Form) */}
      <div className="p-8 w-full md:w-2/3">
        {error && (
           <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center justify-between">
             <span className="font-medium text-sm">{error}</span>
             <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-700 font-bold">&times;</button>
           </div>
        )}

        <form onSubmit={handlePurchase}>
          {isFijo && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">1. Elige la fecha y hora inicial</h3>
              <p className="text-slate-500 mb-6 text-sm">Este horario se agendará todas las semanas durante {pkg.session_count} semanas.</p>
              
              {/* Date selection */}
              <div className="flex gap-3 overflow-x-auto pb-4 mb-4 snap-x no-scrollbar">
                {days.map((date) => {
                  const isSelected = isSameDay(date, selectedDate)
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date)
                        setSelectedTime(null)
                      }}
                      className={`flex flex-col items-center min-w-[80px] p-4 rounded-2xl border transition-all snap-start ${
                        isSelected 
                          ? 'brand-bg-contrast shadow-md transform scale-105' 
                          : 'border-slate-200 text-slate-700 hover-brand-action'
                      }`}
                    >
                      <span className="text-sm font-semibold uppercase opacity-80 mb-1">{format(date, 'EEE', { locale: es })}</span>
                      <span className="text-2xl font-bold">{format(date, 'd')}</span>
                      <span className="text-xs font-medium opacity-80 mt-1">{format(date, 'MMM', { locale: es })}</span>
                    </button>
                  )
                })}
              </div>

              {/* Time selection */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Horarios Iniciales Disponibles para el {format(selectedDate, "EEEE d", { locale: es })}
                </h4>
                
                {slots.length === 0 ? (
                  <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                    No hay horarios disponibles para este día. Intenta seleccionando otra fecha.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {slots.map((slotIso) => {
                      const date = new Date(slotIso)
                      const isSelected = selectedTime && slotIso === selectedTime.toISOString()
                      return (
                        <button
                          key={slotIso}
                          type="button"
                          onClick={() => setSelectedTime(date)}
                          className={`py-3 px-2 border font-bold rounded-xl transition-all ${
                            isSelected 
                              ? 'brand-bg-contrast border-transparent ring-2 ring-offset-2 brand-ring shadow-md transform scale-105' 
                              : 'border-slate-200 bg-slate-50 brand-text hover-brand-action'
                          }`}
                        >
                          {format(date, 'HH:mm')}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={`${isFijo ? 'border-t border-slate-200 pt-8' : ''}`}>
             <h3 className="text-lg font-bold text-slate-900 mb-4">{isFijo ? '2. ' : ''}Tus Datos</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Nombre completo" 
                    required 
                    className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Correo electrónico" 
                    required 
                    className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
             </div>

             <button 
                type="submit" 
                disabled={isSubmitting || (isFijo && !selectedTime)}
                className="w-full group relative flex justify-center items-center gap-3 py-4 px-6 border border-transparent rounded-2xl brand-bg-contrast font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 brand-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
             >
                {isSubmitting ? (
                  <Spinner size="sm" color="white" />
                ) : (
                  <>
                    <CreditCard className="w-6 h-6 mr-1" />
                    Pagar Paquete de ${pkg.total_price}
                  </>
                )}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
