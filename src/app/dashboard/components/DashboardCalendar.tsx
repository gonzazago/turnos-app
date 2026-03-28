'use client'

import { useState } from 'react'
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MonthView } from './views/MonthView'
import { WeekView } from './views/WeekView'
import { DayView } from './views/DayView'

export type ViewType = 'month' | 'week' | 'day'

export function DashboardCalendar({ bookings }: { bookings: any[] }) {
  const [view, setView] = useState<ViewType>('month')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  const navigatePrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1))
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
    else setCurrentDate(subDays(currentDate, 1))
  }

  const navigateNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1))
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else setCurrentDate(addDays(currentDate, 1))
  }

  const navigateToday = () => setCurrentDate(new Date())

  // Formatting header title
  let headerTitle = ''
  if (view === 'month') headerTitle = format(currentDate, 'MMMM yyyy', { locale: es })
  else if (view === 'week') headerTitle = 'Semana del ' + format(currentDate, "d 'de' MMMM", { locale: es })
  else headerTitle = format(currentDate, "EEEE, d 'de' MMMM yyyy", { locale: es })

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)] min-h-[800px]">
      {/* Calendar Header */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['day', 'week', 'month'] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg capitalize transition-colors ${
                  view === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <button onClick={navigateToday} className="px-4 py-1.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 rounded-xl px-2 py-1">
           <button onClick={navigatePrev} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
             <ChevronLeft className="w-5 h-5" />
           </button>
           <h2 className="text-sm font-bold text-slate-800 min-w-[150px] text-center capitalize">
             {headerTitle}
           </h2>
           <button onClick={navigateNext} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex-1 overflow-auto bg-slate-50/50 relative">
         {view === 'month' && <MonthView currentDate={currentDate} bookings={bookings} />}
         {view === 'week' && <WeekView currentDate={currentDate} bookings={bookings} />}
         {view === 'day' && <DayView currentDate={currentDate} bookings={bookings} />}
      </div>
    </div>
  )
}
