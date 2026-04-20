'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/ui/Button'
import { getOnboardingStatus, completeOnboarding } from '../onboarding/actions'
import { Rocket, Palette, Calendar, Info, CheckCircle2 } from 'lucide-react'
import { LiveCard } from './LiveCard'
import { Input } from '@/components/ui/Input'

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Step 2 Profile State
  const [profile, setProfile] = useState({
    fullName: '',
    brandColor: '#3b82f6',
    logoUrl: '',
    fontFamily: 'Inter'
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

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-600 italic text-base font-medium">
              [Formulario de servicio - Próximamente]
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button onClick={handleSkip} size="lg" className="w-full text-base py-4 rounded-2xl">
                Finalizar configuración
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
