'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, addDays, startOfDay, addMinutes, isSameDay, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, ArrowLeft, Mail, User, CheckCircle, CreditCard, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { purchasePackage } from './actions'
import { getAvailableSlots, Availability, Booking } from '@/utils/availability'
import { Spinner } from '@/components/Spinner'
import { calculatePackageDates } from '@/utils/package-dates'

const DAYS_LABELS: Record<number, string> = {
  1: 'Lu', 2: 'Ma', 3: 'Mi', 4: 'Ju', 5: 'Vi', 6: 'Sa', 0: 'Do'
}

interface Variant {
  session_count: number
  price: number
}

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
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(pkg.variants?.[0] || { session_count: pkg.session_count, price: pkg.total_price })
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFijo = pkg.scheduling_type === 'fijo'
  const allowedDays = pkg.allowed_days || []
  const durationMins = pkg.event_types?.duration_mins || 60

  // Calendar logic for 'fijo'
  const today = startOfDay(new Date())
  
  // Filter days that are allowed by the professional
  const availableDays = useMemo(() => {
    const days: Date[] = []
    let current = today
    while (days.length < 14) {
      if (allowedDays.includes(getDay(current))) {
        days.push(current)
      }
      current = addDays(current, 1)
    }
    return days
  }, [allowedDays])

  // Initial date selection
  useEffect(() => {
    if (isFijo && availableDays.length > 0 && !selectedDate) {
      setSelectedDate(availableDays[0])
    }
  }, [isFijo, availableDays])

  const slots = useMemo(() => {
    if (!isFijo || !selectedDate) return []
    return getAvailableSlots(
      selectedDate,
      availability,
      bookedSlots,
      durationMins,
      googleBusySlots
    )
  }, [isFijo, selectedDate, availability, bookedSlots, durationMins, googleBusySlots])

  const packageSessions = useMemo(() => {
    if (!isFijo || !selectedTime || !selectedVariant) return []
    return calculatePackageDates(selectedTime, selectedVariant.session_count, allowedDays)
  }, [isFijo, selectedTime, selectedVariant, allowedDays])

  const handlePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedVariant) return
    if (isFijo && !selectedTime) return

    setIsSubmitting(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    // add hidden fields
    formData.append('profileId', profile.id)
    formData.append('packageId', pkg.id)
    formData.append('sessionCount', selectedVariant.session_count.toString())
    formData.append('price', selectedVariant.price.toString())

    if (isFijo && selectedTime) {
      formData.append('startTime', selectedTime.toISOString())
      formData.append('durationMins', durationMins.toString())
      formData.append('sessionDates', JSON.stringify(packageSessions.map(d => d.toISOString())))
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
              Serás redirigido a <strong>Mercado Pago</strong> para finalizar la compra de tu paquete.
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
            <div className="flex flex-col">
              <span>Paquete de Sesiones {isFijo ? 'Recurrentes' : ''}</span>
              {isFijo && allowedDays.length > 0 && (
                <span className="text-xs text-slate-500 mt-0.5">
                  Días: {allowedDays.sort((a: number, b: number) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b)).map((d: number) => DAYS_LABELS[d]).join(', ')}
                </span>
              )}
            </div>
          </div>
          {pkg.event_types && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <span>{pkg.event_types.title} ({pkg.event_types.duration_mins}m)</span>
            </div>
          )}
        </div>

        {selectedVariant && (
          <div className="mt-auto pt-6 border-t border-slate-200">
            <p className="text-slate-500 text-sm mb-1">Total a pagar</p>
            <p className="text-3xl font-bold text-slate-900">${selectedVariant.price}</p>
            <p className="text-sm font-bold text-blue-600 mt-1">{selectedVariant.session_count} sesiones</p>
            {isFijo ? (
              <p className="text-xs text-slate-500 mt-2 italic">Al pagar, se reservarán de forma automática todos los turnos calculados.</p>
            ) : (
              <p className="text-xs text-slate-500 mt-2">Al pagar, obtendrás créditos a tu favor para usar cuando desees.</p>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-8 w-full md:w-2/3 max-h-[85vh] overflow-y-auto no-scrollbar">
        {error && (
           <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center justify-between">
             <span className="font-medium text-sm">{error}</span>
             <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-700 font-bold">&times;</button>
           </div>
        )}

        <form onSubmit={handlePurchase} className="flex flex-col gap-10">
          
          {/* STEP 1: VARIANT SELECTION */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
               <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
               Elige tu opción preferida
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(pkg.variants || []).map((v: Variant, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedVariant?.session_count === v.session_count 
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-slate-900">{v.session_count} Sesiones</p>
                  <p className="text-xl font-black text-slate-900 mt-1">${v.price}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-2">${(v.price / v.session_count).toFixed(2)} por sesión</p>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: DATE SELECTION (only for FIJO) */}
          {isFijo && selectedVariant && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Elige la fecha y hora inicial
              </h3>
              <p className="text-slate-500 mb-6 text-sm">El sistema buscará los horarios disponibles basándose en tu selección inicial.</p>
              
              <div className="flex gap-3 overflow-x-auto pb-4 mb-4 snap-x no-scrollbar">
                {availableDays.map((date) => {
                  const isSelected = selectedDate && isSameDay(date, selectedDate)
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date)
                        setSelectedTime(null)
                      }}
                      className={`flex flex-col items-center min-w-[80px] p-4 rounded-2xl border-2 transition-all snap-start ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/30 shadow-md transform scale-105' 
                          : 'border-slate-100 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold uppercase opacity-60 mb-1">{format(date, 'EEE', { locale: es })}</span>
                      <span className="text-2xl font-black">{format(date, 'd')}</span>
                      <span className="text-[10px] font-bold opacity-60 mt-1 uppercase">{format(date, 'MMM', { locale: es })}</span>
                    </button>
                  )
                })}
              </div>

              {selectedDate && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Horarios para el {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                  </h4>
                  
                  {slots.length === 0 ? (
                    <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                      No hay horarios disponibles para este día. Intenta seleccionando otra fecha.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {slots.map((slotIso) => {
                        const date = new Date(slotIso)
                        const isSelected = selectedTime && slotIso === selectedTime.toISOString()
                        return (
                          <button
                            key={slotIso}
                            type="button"
                            onClick={() => setSelectedTime(date)}
                            className={`py-3 px-2 border-2 font-bold rounded-xl text-sm transition-all ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-105' 
                                : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                            }`}
                          >
                            {format(date, 'HH:mm')}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Session Preview */}
              {selectedTime && packageSessions.length > 0 && (
                <div className="mt-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 animate-in zoom-in-95 duration-300">
                   <h4 className="text-sm font-bold text-blue-800 mb-4 uppercase tracking-wider">Cronograma de Sesiones</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                      {packageSessions.map((date, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-blue-700">
                           <CheckCircle className="w-3.5 h-3.5" />
                           <span>{format(date, "EEE d 'de' MMM, HH:mm", { locale: es })}</span>
                        </div>
                      ))}
                   </div>
                   <p className="text-[10px] text-blue-400 mt-6 font-bold uppercase">Todos estos turnos se reservarán automáticamente al pagar.</p>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-slate-100 pt-8">
             <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                   {isFijo ? '3' : '2'}
                </span>
                Tus Datos
             </h3>
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
                disabled={isSubmitting || !selectedVariant || (isFijo && !selectedTime)}
                className="w-full group relative flex justify-center items-center gap-3 py-4 px-6 border border-transparent rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-600/20"
             >
                {isSubmitting ? (
                  <Spinner size="sm" color="white" />
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    Pagar ${selectedVariant?.price || pkg.total_price}
                  </>
                )}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
