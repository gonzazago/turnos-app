'use client'

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { X, ChevronRight } from 'lucide-react'

interface TourStep {
  target: string
  title: string
  content: string
  position: 'right' | 'bottom' | 'top'
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="nav-dashboard"]',
    title: 'Próximas Citas',
    content: 'Aquí verás todas tus citas confirmadas y podrás administrarlas.',
    position: 'right'
  },
  {
    target: '[data-tour="nav-event-types"]',
    title: 'Tipos de Eventos',
    content: 'Define tus servicios, duración y precios para que los clientes puedan agendar.',
    position: 'right'
  },
  {
    target: '[data-tour="nav-settings"]',
    title: 'Configuración',
    content: 'Personaliza tu perfil, branding y reglas de disponibilidad.',
    position: 'right'
  },
  {
    target: '[data-tour="nav-profile"]',
    title: 'Tu Perfil',
    content: 'Cambia tu logo, nombre y cierra sesión cuando lo necesites.',
    position: 'right'
  }
]

export function GuidedTour() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(-1)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isReady, setIsReady] = useState(false)
  
  const tourActive = searchParams.get('tour') === 'true'

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('has_seen_tour') === 'true'
    const isMobile = window.innerWidth < 768

    if (tourActive && !hasSeenTour && !isMobile) {
      // Small delay to ensure layout is ready
      const timer = setTimeout(() => {
        setCurrentStep(0)
        setIsReady(true)
      }, 500)
      return () => clearTimeout(timer)
    } else if (tourActive && isMobile) {
      // If mobile, just clear the tour param and mark as seen or just exit
      handleComplete()
    }
  }, [tourActive])

  useLayoutEffect(() => {
    if (currentStep >= 0 && currentStep < TOUR_STEPS.length) {
      const step = TOUR_STEPS[currentStep]
      const element = document.querySelector(step.target)
      if (element) {
        setTargetRect(element.getBoundingClientRect())
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        // Target not found, maybe move to next or end
        setTargetRect(null)
      }
    } else {
      setTargetRect(null)
    }
  }, [currentStep])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (currentStep >= 0 && currentStep < TOUR_STEPS.length) {
        const step = TOUR_STEPS[currentStep]
        const element = document.querySelector(step.target)
        if (element) setTargetRect(element.getBoundingClientRect())
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setCurrentStep(-1)
    setTargetRect(null)
    setIsReady(false)
    // Remove tour param from URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tour')
    router.replace(`/dashboard?${params.toString()}`)
    localStorage.setItem('has_seen_tour', 'true')
  }

  if (currentStep === -1 || !targetRect || !isReady) return null

  const step = TOUR_STEPS[currentStep]

  // Tooltip positioning logic
  const isNearBottom = targetRect.top > window.innerHeight - 250;
  
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 100,
    left: targetRect.left + targetRect.width + 20,
    ...(isNearBottom 
      ? { bottom: 20, transform: 'none' }
      : { top: targetRect.top + targetRect.height / 2, transform: 'translateY(-50%)' }
    )
  }

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      {/* Overlay with cutout hole */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect 
              x={targetRect.left - 8} 
              y={targetRect.top - 4} 
              width={targetRect.width + 16} 
              height={targetRect.height + 8} 
              fill="black" 
              rx="8" 
            />
          </mask>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(15, 23, 42, 0.6)" 
          mask="url(#tour-mask)" 
          className="backdrop-blur-[2px]"
        />
      </svg>

      {/* Tooltip Content */}
      <div 
        style={tooltipStyle}
        className="pointer-events-auto w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in duration-300"
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-bold text-slate-900">{step.title}</h4>
          <span className="text-xs font-semibold text-slate-400">
            {currentStep + 1} / {TOUR_STEPS.length}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {step.content}
        </p>
        
        <div className="flex items-center justify-between">
          <button 
            onClick={handleSkip}
            className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Omitir
          </button>
          <Button 
            onClick={handleNext}
            size="sm"
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </div>
      </div>
    </div>
  )
}
