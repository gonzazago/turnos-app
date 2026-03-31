'use client'

import { useState } from 'react'
import { updateAvailability } from './actions'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

const DAYS = [
  { id: 0, label: 'Domingo' },
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
]

export function AvailabilityForm({ initialAvailability }: { initialAvailability: any[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Map database availability to local state
  const [schedule, setSchedule] = useState(() => {
    const defaultSchedule = DAYS.map(day => {
      const existing = initialAvailability.find(a => a.day_of_week === day.id)
      return {
        day_of_week: day.id,
        enabled: !!existing,
        start_time: existing ? existing.start_time.substring(0, 5) : '09:00',
        end_time: existing ? existing.end_time.substring(0, 5) : '17:00'
      }
    })
    return defaultSchedule
  })

  const toggleDay = (dayId: number) => {
    setSchedule(prev => prev.map(day => 
      day.day_of_week === dayId ? { ...day, enabled: !day.enabled } : day
    ))
  }

  const updateTime = (dayId: number, field: 'start_time' | 'end_time', value: string) => {
    setSchedule(prev => prev.map(day => 
      day.day_of_week === dayId ? { ...day, [field]: value } : day
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const payload = schedule
      .filter(day => day.enabled)
      .map(day => ({
        day_of_week: day.day_of_week,
        start_time: day.start_time,
        end_time: day.end_time
      }))

    try {
      const res = await updateAvailability(payload)
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError('Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col gap-8 max-w-2xl mt-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Horario de Disponibilidad</h2>
        <p className="text-slate-500 text-sm mt-1">Configura tus horas de trabajo generales para cada día de la semana.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-3 border border-green-100">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Horario actualizado correctamente.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {schedule.map((day) => (
          <div key={day.day_of_week} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-4">
            <div className="flex items-center gap-3 min-w-[140px]">
              <input 
                type="checkbox" 
                checked={day.enabled} 
                onChange={() => toggleDay(day.day_of_week)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`font-medium ${day.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                {DAYS.find(d => d.id === day.day_of_week)?.label}
              </span>
            </div>

            {day.enabled ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="time" 
                    value={day.start_time} 
                    onChange={(e) => updateTime(day.day_of_week, 'start_time', e.target.value)}
                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <span className="text-slate-400">—</span>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="time" 
                    value={day.end_time} 
                    onChange={(e) => updateTime(day.day_of_week, 'end_time', e.target.value)}
                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            ) : (
              <span className="text-slate-400 text-sm italic py-2">No disponible</span>
            )}
          </div>
        ))}

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/20 disabled:opacity-70"
          >
            {loading ? 'Guardando...' : 'Guardar Horario'}
          </button>
        </div>
      </form>
    </div>
  )
}
