'use client'

import { useState } from 'react'
import { createEventType } from './actions'
import { AvailabilitySettings, AvailabilityDay } from '../components/AvailabilitySettings'

const DEFAULT_SCHEDULE: AvailabilityDay[] = [
  { day_of_week: 1, enabled: true, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 2, enabled: true, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 3, enabled: true, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 4, enabled: true, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 5, enabled: true, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 6, enabled: false, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 0, enabled: false, start_time: '09:00', end_time: '17:00' },
]

export function NewEventForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [schedule, setSchedule] = useState<AvailabilityDay[]>(DEFAULT_SCHEDULE)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const availability = schedule
      .filter(d => d.enabled)
      .map(d => ({
        day_of_week: d.day_of_week,
        start_time: d.start_time,
        end_time: d.end_time
      }))
    
    try {
      const res = await createEventType(formData, availability)
      if (res?.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
        setSchedule(DEFAULT_SCHEDULE)
      }
    } catch (err) {
      setError('Ocurrió un error.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <span>+ Nuevo Tipo de Evento</span>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Crear Nuevo Evento</h3>
      
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-semibold text-slate-700">Título del evento</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            required 
            placeholder="ej. Reunión de 30 mins"
            className="border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="duration_mins" className="text-sm font-semibold text-slate-700">Duración (minutos)</label>
          <input 
            type="number" 
            id="duration_mins" 
            name="duration_mins" 
            defaultValue="30"
            required 
            min="5"
            step="5"
            className="border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-semibold text-slate-700">Descripción (Opcional)</label>
          <textarea 
            id="description" 
            name="description" 
            rows={3}
            placeholder="Detalles sobre qué se hablará en esta reunión."
            className="border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
          ></textarea>
        </div>

        <AvailabilitySettings schedule={schedule} setSchedule={setSchedule} />

        <div className="flex gap-3 justify-end mt-2">
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? 'Guardando...' : 'Guardar Evento'}
          </button>
        </div>
      </form>
    </div>
  )
}
