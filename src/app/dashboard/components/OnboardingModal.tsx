'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/ui/Button'
import { getOnboardingStatus, completeOnboarding } from '../onboarding/actions'
import { Rocket, Palette, Calendar, CheckCircle2 } from 'lucide-react'

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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
      size="lg"
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
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Palette className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Personaliza tu perfil</h2>
            </div>
            <p className="text-slate-600">
              Elige los colores y logo que verán tus clientes al reservar.
            </p>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center text-slate-400 italic">
              [Vista previa en tiempo real - Próximamente]
            </div>

            <div className="pt-6 flex flex-col gap-3">
              <Button onClick={nextStep} size="lg" className="w-full">
                Siguiente: Mi primer servicio
              </Button>
              <Button onClick={handleSkip} variant="ghost" size="sm" className="text-slate-400">
                Saltar guía
              </Button>
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
