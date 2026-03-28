import { startOfWeek, endOfWeek, eachDayOfInterval, format, parseISO, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

export function WeekView({ currentDate, bookings }: { currentDate: Date, bookings: any[] }) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const hours = Array.from({ length: 13 }).map((_, i) => i + 8) // 08:00 to 20:00

  const getStyle = (startISO: string, durationMins: number) => {
    const d = parseISO(startISO)
    const startMins = d.getHours() * 60 + d.getMinutes()
    const offsetMins = startMins - (8 * 60)
    
    const top = Math.max(0, (offsetMins / 720) * 100)
    const height = (durationMins / 720) * 100

    return { top: `${top}%`, height: `${height}%` }
  }

  return (
    <div className="flex flex-col min-w-[800px] bg-white h-full border-r border-slate-200">
      {/* Header */}
      <div className="flex border-b border-slate-200 sticky top-0 bg-white z-20">
        <div className="w-16 border-r border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-medium">GMT</div>
        {days.map(day => {
          const isToday = isSameDay(day, new Date())
          return (
            <div key={day.toISOString()} className="flex-1 text-center py-3 border-r border-slate-200 relative">
              <p className={`text-[11px] font-bold uppercase ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>{format(day, 'EEE', { locale: es })}</p>
              <div className={`mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-bold ${isToday ? 'bg-blue-600 text-white' : 'text-slate-800'}`}>
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Body */}
      <div className="flex flex-1 relative min-h-[800px]">
        {/* Time column */}
        <div className="w-16 border-r border-slate-200 bg-slate-50 flex flex-col relative z-0">
          {hours.map(h => {
             const top = ((h - 8) / 12) * 100
             return (
              <div key={h} className="absolute right-2 text-xs font-semibold text-slate-400" style={{ top: `${top}%`, transform: 'translateY(-50%)' }}>
                {h === 8 || h === 20 ? '' : `${h}:00`}
              </div>
             )
          })}
        </div>

        {/* Days grid */}
        <div className="flex flex-1 relative">
           {/* Horizontal lines */}
           <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
             {hours.slice(0, 12).map((_, i) => (
               <div key={i} className="flex-1 border-t border-slate-100" style={{ height: `${100/12}%` }}></div>
             ))}
           </div>
           
           {/* Day columns */}
           {days.map(day => {
               const dayBookings = bookings.filter(b => isSameDay(parseISO(b.start_time), day))
               return (
                 <div key={day.toISOString()} className="flex-1 border-r border-slate-200 relative h-full z-10">
                    {dayBookings.map(b => (
                      <div 
                        key={b.id} 
                        className="absolute inset-x-[2px] rounded border border-blue-600 bg-blue-500 text-white px-2 py-1 text-xs overflow-hidden shadow-sm hover:z-20 hover:scale-[1.02] hover:shadow-md transition-all cursor-pointer"
                        style={getStyle(b.start_time, b.event_types?.duration_mins || 30)}
                      >
                         <p className="font-bold truncate">{b.event_types?.title}</p>
                         <p className="font-medium opacity-80 truncate text-[10px]">{format(parseISO(b.start_time), 'HH:mm')} - {b.booker_name}</p>
                      </div>
                    ))}
                 </div>
               )
           })}
        </div>
      </div>
    </div>
  )
}
