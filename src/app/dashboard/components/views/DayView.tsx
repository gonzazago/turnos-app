import { format, parseISO, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

export function DayView({ 
  currentDate, 
  bookings, 
  onBookingClick 
}: { 
  currentDate: Date, 
  bookings: any[],
  onBookingClick: (booking: any) => void
}) {
  const hours = Array.from({ length: 13 }).map((_, i) => i + 8)

  const getStyle = (startISO: string, durationMins: number) => {
    const d = parseISO(startISO)
    const startMins = d.getHours() * 60 + d.getMinutes()
    const offsetMins = startMins - (8 * 60)
    const top = Math.max(0, (offsetMins / 720) * 100)
    const height = (durationMins / 720) * 100
    return { top: `${top}%`, height: `${height}%` }
  }

  const dayBookings = bookings.filter(b => isSameDay(parseISO(b.start_time), currentDate))

  return (
    <div className="flex flex-col min-w-full bg-white h-full border-r border-slate-200">
      {/* Header */}
      <div className="flex border-b border-slate-200 sticky top-0 bg-white z-20">
        <div className="w-16 border-r border-slate-200 bg-slate-50"></div>
        <div className="flex-1 text-center py-4 relative border-r border-slate-200">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{format(currentDate, 'EEEE', { locale: es })}</p>
          <div className="mt-1 flex items-center justify-center">
             <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl font-bold shadow-sm">
               {format(currentDate, 'd')}
             </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 relative min-h-[800px]">
        {/* Time column */}
        <div className="w-16 border-r border-slate-200 bg-slate-50 relative z-0">
          {hours.map(h => (
            <div key={h} className="absolute right-2 text-xs font-semibold text-slate-400" style={{ top: `${((h - 8) / 12) * 100}%`, transform: 'translateY(-50%)' }}>
              {h === 8 || h === 20 ? '' : `${h}:00`}
            </div>
          ))}
        </div>

        {/* Day column */}
        <div className="flex-1 relative border-r border-slate-200 z-10">
           <div className="absolute inset-0 pointer-events-none z-0">
             {hours.slice(0, 12).map((_, i) => (
               <div key={i} className="border-t border-slate-100 w-full" style={{ height: `${100/12}%` }}></div>
             ))}
           </div>
           
           <div className="absolute inset-0 h-full mx-4 z-10 pt-0">
              {dayBookings.map(b => (
                <div 
                  key={b.id} 
                  onClick={() => onBookingClick(b)}
                  className="absolute inset-x-0 rounded-xl bg-blue-500 text-white p-3 text-sm font-semibold overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer border-l-4 border-blue-700"
                  style={getStyle(b.start_time, b.event_types?.duration_mins || 30)}
                >
                   <p className="text-[15px] font-bold truncate">
                     {format(parseISO(b.start_time), 'HH:mm')} - {b.event_types?.title}
                   </p>
                   <div className="font-medium opacity-90 truncate mt-1 flex items-center gap-2">
                     <span className="bg-blue-600/50 px-2 py-0.5 rounded text-xs">Con {b.booker_name}</span>
                     <span className="text-xs">{b.booker_email}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}
