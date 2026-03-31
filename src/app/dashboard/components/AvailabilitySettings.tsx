'use client'

import { Clock } from 'lucide-react'

const DAYS = [
  { id: 0, label: 'Domingo' },
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
]

export interface AvailabilityDay {
  day_of_week: number
  enabled: boolean
  start_time: string
  end_time: string
}

export function AvailabilitySettings({ 
  schedule, 
  setSchedule 
}: { 
  schedule: AvailabilityDay[], 
  setSchedule: (s: AvailabilityDay[]) => void 
}) {
  const toggleDay = (dayId: number) => {
    setSchedule(schedule.map(day => 
      day.day_of_week === dayId ? { ...day, enabled: !day.enabled } : day
    ))
  }

  const updateTime = (dayId: number, field: 'start_time' | 'end_time', value: string) => {
    setSchedule(schedule.map(day => 
      day.day_of_week === dayId ? { ...day, [field]: value } : day
    ))
  }

  return (
    <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-5 h-5 text-blue-600" />
        <h4 className="font-bold text-slate-900">Horario de Disponibilidad</h4>
      </div>
      
      {schedule.map((day) => (
        <div key={day.day_of_week} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-200 last:border-0 gap-3">
          <div className="flex items-center gap-3 min-w-[120px]">
            <input 
              type="checkbox" 
              checked={day.enabled} 
              onChange={() => toggleDay(day.day_of_week)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm font-medium ${day.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
              {DAYS.find(d => d.id === day.day_of_week)?.label}
            </span>
          </div>

          {day.enabled ? (
            <div className="flex items-center gap-2">
              <input 
                type="time" 
                value={day.start_time} 
                onChange={(e) => updateTime(day.day_of_week, 'start_time', e.target.value)}
                className="px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <span className="text-slate-400 text-xs">—</span>
              <input 
                type="time" 
                value={day.end_time} 
                onChange={(e) => updateTime(day.day_of_week, 'end_time', e.target.value)}
                className="px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          ) : (
            <span className="text-slate-400 text-xs italic">No disponible</span>
          )}
        </div>
      ))}
    </div>
  )
}
