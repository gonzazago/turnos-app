'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/ui/Button'
import { getOnboardingStatus, completeOnboarding } from '../onboarding/actions'
import { updateProfile } from '../settings/actions'
import { createEventType } from '../event-types/actions'
import { Rocket, Palette, Calendar, Info, CheckCircle2, Clock, Check, Copy, Share2, Globe } from 'lucide-react'
import { LiveCard } from './LiveCard'
import { Input } from '@/components/ui/Input'
import { Dropdown } from '@/components/ui/Dropdown'

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userSlug, setUserSlug] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  // Step 2 Profile State
  const [profile, setProfile] = useState({
    fullName: '',
    brandColor: '#3b82f6',
    logoUrl: '',
    fontFamily: 'var(--font-geist-sans)'
  })

  // Step 3 Event State
  const [event, setEvent] = useState({
    title: '',
    duration: '30',
  })

  // Step 3 Availability State (Default Mon-Fri 9-17)
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])

  const days = [
    { label: 'Dom', value: 0 },
    { label: 'Lun', value: 1 },
    { label: 'Mar', value: 2 },
    { label: 'Mié', value: 3 },
    { label: 'Jue', value: 4 },
    { label: 'Vie', value: 5 },
    { label: 'Sáb', value: 6 },
  ]

  const durationOptions = [
    { label: '15 minutos', value: '15' },
    { label: '30 minutos', value: '30' },
    { label: '45 minutos', value: '45' },
    { label: '1 hora', value: '60' },
    { label: '1.5 horas', value: '90' },
    { label: '2 horas', value: '120' },
  ]

  useEffect(() => {
    async function checkStatus() {
      const result = await getOnboardingStatus()
      if (result && 'hasCompletedOnboarding' in result && !result.hasCompletedOnboarding) {
        setIsOpen(true)
      }
      setIsLoading(false)
    }
    checkStatus()
  }, [])

  const handleSkip = async () => {
    const result = await completeOnboarding()
    if (result && 'success' in result) {
      setIsOpen(false)
      router.push('/dashboard/settings')
    }
  }

  const nextStep = () => {
    setStep(s => s + 1)
  }

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleFinishStep3 = async () => {
    setIsSubmitting(true)
    try {
      // 1. Update Profile
      const profileFormData = new FormData()
      profileFormData.append('fullName', profile.fullName || 'Tu Nombre')
      profileFormData.append('brandColor', profile.brandColor)
      profileFormData.append('slug', '')
      
      const profileResult = await updateProfile(profileFormData)
      if ('error' in profileResult) throw new Error(profileResult.error)

      // 2. Create First Event Type
      const eventFormData = new FormData()
      eventFormData.append('title', event.title || 'Consulta Inicial')
      eventFormData.append('duration_mins', event.duration)
      
      const availability = selectedDays.map(day => ({
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00'
      }))

      const eventResult = await createEventType(eventFormData, availability)
      if ('error' in eventResult) throw new Error(eventResult.error)

      // 3. Mark Onboarding as Complete (logic-wise, but we show Step 4)
      const onboardingResult = await completeOnboarding()
      if ('error' in onboardingResult) throw new Error(onboardingResult.error)

      // Get user slug for Step 4
      if (profileResult.profile?.slug) {
        setUserSlug(profileResult.profile.slug)
      }

      setStep(4)
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Ocurrió un error al guardar tu configuración.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    router.push('/dashboard')
  }

  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${userSlug}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  if (isLoading || !isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} 
      title={step === 1 ? "¡Bienvenido a turnos.app!" : "Configura tu cuenta"}
      size={step === 1 ? "lg" : "xl"}
    >
      <div className="space-y-6">
        {/* Step Indicators */}
        <div className="flex justify-center items-center gap-1.5 md:gap-2 mb-4 md:mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                step === s ? 'w-6 md:w-8 bg-blue-600' : 'w-1.5 md:w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-2">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-2">
              <Rocket className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">¡Tu plataforma está lista!</h2>
              <p className="text-base md:text-lg text-slate-700 max-w-sm mx-auto leading-relaxed font-medium">
                Te guiaremos en unos pocos pasos para que tu página de reservas se vea increíble y puedas recibir tu primer turno.
              </p>
            </div>
            <div className="pt-6 flex flex-col gap-3">
              <Button onClick={nextStep} size="lg" className="w-full text-base py-4 rounded-2xl">
                Continuar
              </Button>
              <Button onClick={handleSkip} variant="ghost" size="sm" className="text-slate-600 font-bold">
                Saltar guía
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Form Side */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                      <Palette className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">Personaliza tu perfil</h2>
                  </div>
                  <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium">
                    Elige los colores y logo que verán tus clientes al reservar.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      Nombre público
                      <Info className="w-4 h-4 text-slate-500" />
                    </label>
                    <Input 
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => setProfile(p => ({ ...p, fullName: e.target.value }))}
                      placeholder="Ej. Dr. Juan Pérez"
                      className="rounded-2xl border-slate-300 py-3.5 text-base"
                    />
                    <p className="text-xs text-slate-600 mt-1 font-medium">Es el nombre que aparecerá en tu página de reservas.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="brandColor" className="text-sm font-bold text-slate-700">Color de marca</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        id="brandColor"
                        value={profile.brandColor}
                        onChange={(e) => setProfile(p => ({ ...p, brandColor: e.target.value }))}
                        className="w-14 h-14 rounded-2xl border-none cursor-pointer overflow-hidden p-0"
                      />
                      <Input 
                        value={profile.brandColor}
                        onChange={(e) => setProfile(p => ({ ...p, brandColor: e.target.value }))}
                        className="rounded-2xl border-slate-300 flex-1 py-3.5 text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Button onClick={nextStep} size="lg" className="w-full text-base py-4 rounded-2xl">
                    Siguiente: Mi primer servicio
                  </Button>
                  <Button onClick={handleSkip} variant="ghost" size="sm" className="text-slate-600 font-bold">
                    Saltar guía
                  </Button>
                </div>
              </div>

              {/* Preview Side */}
              <div className="hidden md:flex flex-col justify-center items-center p-6 bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden relative min-h-[400px]">
                <div className="absolute top-4 left-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vista previa</div>
                <div className="w-full max-w-[300px]">
                   <LiveCard 
                     fullName={profile.fullName || 'Tu Nombre'} 
                     brandColor={profile.brandColor}
                     logoUrl={profile.logoUrl}
                     fontFamily={profile.fontFamily}
                   />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Form Side */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">Tu primer servicio</h2>
                  </div>
                  <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium">
                    Define qué servicios ofreces, su duración y precio.
                  </p>
                </div>

                <div className="space-y-4">
                  <Input 
                    label="Nombre del servicio"
                    id="eventTitle"
                    value={event.title}
                    onChange={(e) => setEvent(ev => ({ ...ev, title: e.target.value }))}
                    placeholder="Ej. Consulta Inicial, Clase de Yoga, etc."
                    className="rounded-2xl border-slate-300 py-3.5 text-base"
                  />

                  <Dropdown 
                    label="Duración"
                    options={durationOptions}
                    value={event.duration}
                    onChange={(val) => setEvent(ev => ({ ...ev, duration: val }))}
                  />

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700">Tus días de atención (9:00 a 17:00)</label>
                    <div className="flex flex-wrap gap-2">
                      {days.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={cn(
                            "w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all border-2",
                            selectedDays.includes(day.value)
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                              : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                          )}
                        >
                          {day.label.charAt(0)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Button 
                    onClick={handleFinishStep3} 
                    size="lg" 
                    className="w-full text-base py-4 rounded-2xl"
                    isLoading={isSubmitting}
                  >
                    Finalizar configuración
                  </Button>
                </div>
              </div>

              {/* Summary Side */}
              <div className="hidden md:flex flex-col p-8 bg-slate-50 rounded-3xl border border-slate-100 relative">
                <div className="absolute top-4 left-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resumen</div>
                <div className="flex-1 flex flex-col justify-center space-y-6">
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 font-bold uppercase tracking-tight">Servicio</div>
                          <div className="text-lg font-bold text-slate-900">{event.title || 'Consulta Inicial'}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                         <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Duración</div>
                            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                               <Clock className="w-4 h-4" />
                               {durationOptions.find(o => o.value === event.duration)?.label}
                            </div>
                         </div>
                         <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Horario</div>
                            <div className="text-slate-700 font-bold">09:00 - 17:00</div>
                         </div>
                      </div>

                      <div className="pt-2 border-t border-slate-50">
                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">Días activos</div>
                        <div className="flex gap-1.5">
                          {selectedDays.sort().map(d => (
                            <div key={d} className="w-6 h-6 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md flex items-center justify-center">
                              {days.find(day => day.value === d)?.label.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>

                   <p className="text-sm text-slate-500 italic text-center px-4 leading-relaxed font-medium">
                     "Podrás ajustar horarios específicos y precios más tarde en el panel de configuración."
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500 py-4">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce-short">
              <CheckCircle2 className="w-14 h-14" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-slate-900 leading-tight">¡Todo listo!</h2>
              <p className="text-lg text-slate-700 max-w-sm mx-auto leading-relaxed font-medium">
                Tu página de reservas ya está activa. Compártela con tus clientes para empezar a recibir turnos.
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-slate-600 font-bold truncate text-sm">
                    {bookingUrl.replace(/^https?:\/\//, '')}
                  </span>
                </div>
                <Button 
                  onClick={copyToClipboard}
                  variant={copied ? 'primary' : 'outline'}
                  size="sm"
                  className="shrink-0 rounded-xl"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="rounded-2xl py-4 flex items-center gap-2"
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('¡Hola! Ya puedes agendar turnos conmigo aquí: ' + bookingUrl)}`, '_blank')}
                >
                  <Share2 className="w-4 h-4" /> WhatsApp
                </Button>
                <Button 
                  className="rounded-2xl py-4"
                  onClick={handleClose}
                >
                  Ir al Panel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
