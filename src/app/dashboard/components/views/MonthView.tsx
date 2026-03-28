import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function MonthView({ currentDate, bookings }: { currentDate: Date, bookings: any[] }) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div className="flex flex-col min-h-full min-w-[700px]">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 w-full">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase">{day}</div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-[minmax(120px,1fr)] w-full">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isToday = isSameDay(day, new Date())
          
          const dayBookings = bookings.filter(b => isSameDay(parseISO(b.start_time), day))

          return (
            <div key={day.toISOString()} className={`border-r border-b border-slate-200 p-1 transition-colors hover:bg-slate-50/80 ${!isCurrentMonth ? 'bg-slate-100/50 opacity-60' : 'bg-white'}`}>
              <div className={`mt-1 flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold mx-auto ${isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700'}`}>
                {format(day, 'd')}
              </div>
              <div className="mt-1 flex flex-col gap-1 overflow-y-auto max-h-[100px] no-scrollbar px-1">
                {dayBookings.map(b => (
                  <div key={b.id} className="text-xs truncate px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold cursor-pointer border border-blue-200/50 hover:bg-blue-200 transition-colors shadow-sm" title={`${b.event_types?.title} - ${b.booker_name}`}>
                    {format(parseISO(b.start_time), 'HH:mm')} {b.event_types?.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
