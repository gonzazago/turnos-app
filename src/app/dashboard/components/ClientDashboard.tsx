'use client'

import { useState } from 'react'
import { LayoutList, Calendar } from 'lucide-react'
import { BookingList } from './BookingList'
import { DashboardCalendar } from './DashboardCalendar'

export function ClientDashboard({ bookings }: { bookings: any[] }) {
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list')

  return (
    <div className="flex flex-col gap-8">
      {/* View Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'list' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <LayoutList className="w-4 h-4" />
          Listado de Citas
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'calendar' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Vista Calendario
        </button>
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'list' ? (
          <BookingList bookings={bookings} />
        ) : (
          <DashboardCalendar bookings={bookings} />
        )}
      </div>
    </div>
  )
}
