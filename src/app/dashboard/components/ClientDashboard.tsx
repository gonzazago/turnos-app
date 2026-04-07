'use client'

import { useState } from 'react'
import { LayoutList, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { BookingList } from './BookingList'
import { DashboardCalendar } from './DashboardCalendar'

export function ClientDashboard({ bookings }: { bookings: any[] }) {
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list')

  const now = new Date()

  // Calcular ingresos brutos (Señas pagadas)
  const paidBookings = bookings.filter(b => b.payment_status === 'paid' && b.event_types?.requires_deposit);
  const grossRevenue = paidBookings.reduce((acc, b) => {
    const total = parseFloat(b.event_types?.total_price || 0);
    const pct = parseFloat(b.event_types?.deposit_percentage || 0);
    return acc + (total * pct / 100);
  }, 0);

  // Calcular ingresos netos estimando 6.5% MP fee
  const netRevenue = grossRevenue * 0.935;

  // Calcular ingresos proyectados (citas futuras confirmadas)
  const upcomingConfirmedBookings = bookings.filter(b => 
    b.status === 'confirmed' && 
    new Date(b.start_time) > now
  );
  
  const projectedRevenue = upcomingConfirmedBookings.reduce((acc, b) => {
    const total = parseFloat(b.event_types?.total_price || 0);
    // Asumimos que la proyección suma el remanente a cobrar o el total si no hay seña.
    const hasPaidDeposit = b.payment_status === 'paid' && b.event_types?.requires_deposit;
    const paidAmount = hasPaidDeposit ? (total * parseFloat(b.event_types?.deposit_percentage || 0) / 100) : 0;
    return acc + (total - paidAmount);
  }, 0);

  const formatMoney = (val: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  return (
    <div className="flex flex-col gap-8">
      {/* Financial Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-xl text-green-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-slate-500 font-semibold text-sm">Ingresos por Señas (Neto)</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">{formatMoney(netRevenue)}</span>
            <span className="text-sm font-medium text-slate-500 line-through mb-1" title="Monto Bruto sin comisiones">
              {formatMoney(grossRevenue)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">*Descontando 6.5% estimado de Mercado Pago.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-slate-500 font-semibold text-sm">Ingresos Proyectados</h3>
          </div>
          <div className="flex items-end gap-2">
             <span className="text-3xl font-bold text-slate-900">{formatMoney(projectedRevenue)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Saldo a cobrar de {upcomingConfirmedBookings.length} citas agendadas.</p>
        </div>
      </div>

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
