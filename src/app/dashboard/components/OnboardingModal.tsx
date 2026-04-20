'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/ui/Button'
import { getOnboardingStatus, completeOnboarding } from '../onboarding/actions'
import { updateProfile } from '../settings/actions'
import { createEventType } from '../event-types/actions'
import { Rocket, Palette, Calendar, Info, CheckCircle2, Clock } from 'lucide-react'
import { LiveCard } from './LiveCard'
import { Input } from '@/components/ui/Input'

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Step 2 Profile State
  const [profile, setProfile] = useState({
    fullName: '',
    brandColor: '#3b82f6',
    logoUrl: '',
    fontFamily: 'Inter'
  })

  // Step 3 Event State
  const [event, setEvent] = useState({
    title: '',
    duration: '30',
  })

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

  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      // 1. Update Profile (Name and Color)
      const profileFormData = new FormData()
      profileFormData.append('fullName', profile.fullName || 'Tu Nombre')
      profileFormData.append('brandColor', profile.brandColor)
      profileFormData.append('slug', '') // actions.ts handles slug generation or keeping existing
      
      const profileResult = await updateProfile(profileFormData)
      if ('error' in profileResult) throw new Error(profileResult.error)

      // 2. Create First Event Type
      const eventFormData = new FormData()
      eventFormData.append('title', event.title || 'Consulta Inicial')
      eventFormData.append('duration_mins', event.duration)
      
      // Default availability for the first event (Mon-Fri 9-17)
      const defaultAvailability = [1, 2, 3, 4, 5].map(day => ({
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00'
      }))

      const eventResult = await createEventType(eventFormData, defaultAvailability)
      if ('error' in eventResult) throw new Error(eventResult.error)

      // 3. Mark Onboarding as Complete
      const onboardingResult = await completeOnboarding()
      if ('error' in onboardingResult) throw new Error(onboardingResult.error)

      setIsOpen(false)
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Ocurrió un error al guardar tu configuración.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // User must complete or skip
      title={step === 1 ? "¡Bienvenido a turnos.app!" : "Configura tu cuenta"}
      size={step === 2 ? "xl" : "lg"}
    >
      <div className="space-y-6">
        {/* Step Indicators */}
        <div className="flex justify-center items-center gap-1.5 md:gap-2 mb-4 md:mb-8">
          {[1, 2, 3].map((s) => (
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
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
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
              <div className="space-y-2">
                <label htmlFor="eventTitle" className="text-sm font-bold text-slate-700">Nombre del servicio</label>
                <Input 
                  id="eventTitle"
                  value={event.title}
                  onChange={(e) => setEvent(ev => ({ ...ev, title: e.target.value }))}
                  placeholder="Ej. Consulta Inicial, Clase de Yoga, etc."
                  className="rounded-2xl border-slate-300 py-3.5 text-base"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-bold text-slate-700">Duración</label>
                <div className="relative">
                  <select 
                    id="duration"
                    value={event.duration}
                    onChange={(e) => setEvent(ev => ({ ...ev, duration: e.target.value }))}
                    className="w-full border border-slate-300 rounded-2xl py-3.5 px-4 text-slate-900 appearance-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="90">1.5 horas</option>
                    <option value="120">2 horas</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button 
                onClick={handleFinish} 
                size="lg" 
                className="w-full text-base py-4 rounded-2xl"
                isLoading={isSubmitting}
              >
                Finalizar configuración
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
