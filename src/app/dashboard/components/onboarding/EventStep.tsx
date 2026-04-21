'use client'

import React from 'react'
import { Calendar, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dropdown } from '@/components/ui/Dropdown'

interface EventStepProps {
  event: any
  setEvent: (e: any) => void
  selectedDays: number[]
  toggleDay: (d: number) => void
  onFinish: () => void
  isSubmitting: boolean
}

const durationOptions = [
  { label: '15 minutos', value: '15' },
  { label: '30 minutos', value: '30' },
  { label: '45 minutos', value: '45' },
  { label: '1 hora', value: '60' },
  { label: '1.5 horas', value: '90' },
  { label: '2 horas', value: '120' },
]

const days = [
  { label: 'Dom', value: 0 },
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mié', value: 3 },
  { label: 'Jue', value: 4 },
  { label: 'Vie', value: 5 },
  { label: 'Sáb', value: 6 },
]

export function EventStep({ 
  event, 
  setEvent, 
  selectedDays, 
  toggleDay, 
  onFinish, 
  isSubmitting 
}: EventStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              onChange={(e) => setEvent((ev: any) => ({ ...ev, title: e.target.value }))}
              placeholder="Ej. Consultoría, Clase, etc."
              className="rounded-2xl border-slate-300 py-3.5 text-base"
            />

            <Dropdown 
              label="Duración"
              options={durationOptions}
              value={event.duration}
              onChange={(val) => setEvent((ev: any) => ({ ...ev, duration: val }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Desde"
                type="time"
                value={event.startTime}
                onChange={(e) => setEvent((ev: any) => ({ ...ev, startTime: e.target.value }))}
                className="rounded-2xl border-slate-300 py-3.5 text-base"
              />
              <Input 
                label="Hasta"
                type="time"
                value={event.endTime}
                onChange={(e) => setEvent((ev: any) => ({ ...ev, endTime: e.target.value }))}
                className="rounded-2xl border-slate-300 py-3.5 text-base"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Tus días de atención</label>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all border-2 ${
                      selectedDays.includes(day.value)
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {day.label.charAt(0)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button 
              onClick={onFinish} 
              size="lg" 
              className="w-full text-base py-4 rounded-2xl"
              isLoading={isSubmitting}
            >
              Finalizar configuración
            </Button>
          </div>
        </div>

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
                      <div className="text-slate-700 font-bold">{event.startTime} - {event.endTime}</div>
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
  )
}
