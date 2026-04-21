'use client'

import React from 'react'
import { Rocket } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface WelcomeStepProps {
  onNext: () => void
  onSkip: () => void
}

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
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
        <Button onClick={onNext} size="lg" className="w-full text-base py-4 rounded-2xl">
          Continuar
        </Button>
        <Button onClick={onSkip} variant="ghost" size="sm" className="text-slate-600 font-bold">
          Saltar guía
        </Button>
      </div>
    </div>
  )
}
