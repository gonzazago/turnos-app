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
        <div className="flex justify-center items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">¡Tu plataforma está lista!</h2>
            <p className="text-slate-600 max-w-sm mx-auto">
              Te guiaremos en unos pocos pasos para que tu página de reservas se vea increíble y puedas recibir tu primer turno.
            </p>
            <div className="pt-6 flex flex-col gap-3">
              <Button onClick={nextStep} size="lg" className="w-full">
                Continuar
              </Button>
              <Button onClick={handleSkip} variant="ghost" size="sm" className="text-slate-400">
                Saltar guía
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form Side */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Palette className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Personaliza tu perfil</h2>
                  </div>
                  <p className="text-sm text-slate-500">
                    Elige los colores y logo que verán tus clientes al reservar.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      Nombre público
                      <Info className="w-3 h-3 text-slate-400" />
                    </label>
                    <Input 
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => setProfile(p => ({ ...p, fullName: e.target.value }))}
                      placeholder="Ej. Dr. Juan Pérez"
                      className="rounded-xl border-slate-200"
                    />
                    <p className="text-[10px] text-slate-400">Es el nombre que aparecerá en tu página de reservas.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="brandColor" className="text-sm font-bold text-slate-700">Color de marca</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        id="brandColor"
                        value={profile.brandColor}
                        onChange={(e) => setProfile(p => ({ ...p, brandColor: e.target.value }))}
                        className="w-12 h-12 rounded-xl border-none cursor-pointer overflow-hidden p-0"
                      />
                      <Input 
                        value={profile.brandColor}
                        onChange={(e) => setProfile(p => ({ ...p, brandColor: e.target.value }))}
                        className="rounded-xl border-slate-200 flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Button onClick={nextStep} size="lg" className="w-full">
                    Siguiente: Mi primer servicio
                  </Button>
                  <Button onClick={handleSkip} variant="ghost" size="sm" className="text-slate-400">
                    Saltar guía
                  </Button>
                </div>
              </div>

              {/* Preview Side */}
              <div className="hidden md:flex flex-col justify-center items-center p-6 bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden relative min-h-[400px]">
                <div className="absolute top-4 left-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vista previa</div>
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
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Tu primer servicio</h2>
            </div>
            <p className="text-slate-600">
              Define qué servicios ofreces, su duración y precio.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center text-slate-400 italic">
              [Formulario de servicio - Próximamente]
            </div>

            <div className="pt-6 flex flex-col gap-3">
              <Button onClick={handleSkip} size="lg" className="w-full">
                Finalizar configuración
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
