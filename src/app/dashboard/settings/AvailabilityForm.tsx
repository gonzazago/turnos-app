'use client'

import { useState } from 'react'
import { updateAvailability } from './actions'
import { Clock } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

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
        <Alert variant="error">{error}</Alert>
      )}

      {success && (
        <Alert variant="success">Horario actualizado correctamente.</Alert>
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
                <TimeInput 
                  value={day.start_time} 
                  onChange={(val) => updateTime(day.day_of_week, 'start_time', val)}
                />
                <span className="text-slate-400">—</span>
                <TimeInput 
                  value={day.end_time} 
                  onChange={(val) => updateTime(day.day_of_week, 'end_time', val)}
                />
              </div>
            ) : (
              <span className="text-slate-400 text-sm italic py-2">No disponible</span>
            )}
          </div>
        ))}

        <div className="pt-4 flex justify-end">
          <Button type="submit" isLoading={loading}>
            {loading ? 'Guardando...' : 'Guardar Horario'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function TimeInput({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (
    <div className="relative">
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input 
        type="time" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  )
}
