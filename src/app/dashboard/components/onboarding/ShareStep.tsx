'use client'

import React from 'react'
import { CheckCircle2, Globe, Check, Copy, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ShareStepProps {
  bookingUrl: string
  copied: boolean
  onCopy: () => void
  onClose: () => void
}

export function ShareStep({ bookingUrl, copied, onCopy, onClose }: ShareStepProps) {
  return (
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
            onClick={onCopy}
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
            onClick={onClose}
          >
            Ir al Panel
          </Button>
        </div>
      </div>
    </div>
  )
}
