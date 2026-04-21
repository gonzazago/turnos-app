'use client'

import React from 'react'
import { Palette, Info, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LiveCard } from '../LiveCard'

interface ProfileStepProps {
  profile: any
  setProfile: (p: any) => void
  userSlug: string
  setUserSlug: (s: string) => void
  onNext: () => void
  onSkip: () => void
}

export function ProfileStep({ 
  profile, 
  setProfile, 
  userSlug, 
  setUserSlug, 
  onNext, 
  onSkip 
}: ProfileStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                <Palette className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">Personaliza tu perfil</h2>
            </div>
            <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium">
              Elige cómo te verán tus clientes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                Nombre público
                <Info className="w-4 h-4 text-slate-400" />
              </label>
              <Input 
                id="fullName"
                value={profile.fullName}
                onChange={(e) => setProfile((p: any) => ({ ...p, fullName: e.target.value }))}
                placeholder="Ej. Dr. Juan Pérez"
                className="rounded-2xl border-slate-300 py-3.5 text-base"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                Tu enlace personalizado
                <Link2 className="w-4 h-4 text-slate-400" />
              </label>
              <div className="flex items-center">
                <span className="bg-slate-50 border border-r-0 border-slate-300 rounded-l-2xl px-4 py-3.5 text-slate-500 text-sm font-medium">
                  turnos.app/
                </span>
                <Input 
                  id="slug"
                  value={userSlug}
                  onChange={(e) => setUserSlug(e.target.value)}
                  placeholder="tu-nombre"
                  className="rounded-l-none rounded-r-2xl border-slate-300 py-3.5 text-base flex-1"
                  containerClassName="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="brandColor" className="text-sm font-bold text-slate-700">Color de marca</label>
              <div className="flex gap-3">
                <input 
                  type="color" 
                  id="brandColor"
                  value={profile.brandColor}
                  onChange={(e) => setProfile((p: any) => ({ ...p, brandColor: e.target.value }))}
                  className="w-14 h-14 rounded-2xl border-none cursor-pointer overflow-hidden p-0"
                />
                <Input 
                  value={profile.brandColor}
                  onChange={(e) => setProfile((p: any) => ({ ...p, brandColor: e.target.value }))}
                  className="rounded-2xl border-slate-300 flex-1 py-3.5 text-base"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button onClick={onNext} size="lg" className="w-full text-base py-4 rounded-2xl">
              Siguiente: Mi primer servicio
            </Button>
            <Button onClick={onSkip} variant="ghost" size="sm" className="text-slate-600 font-bold">
              Saltar guía
            </Button>
          </div>
        </div>

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
  )
}
