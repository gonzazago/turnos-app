'use client'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { X, User, Mail, Calendar, Clock, CreditCard, Info } from 'lucide-react'

export function BookingDetailsModal({ 
  booking, 
  onClose 
}: { 
  booking: any, 
  onClose: () => void 
}) {
  if (!booking) return null

  const startTime = parseISO(booking.start_time)
  const endTime = parseISO(booking.end_time)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900 pr-8">
            Detalles de la Cita
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            {booking.event_types?.title}
          </p>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col gap-8">
          
          {/* Time and Date */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">Fecha y Hora</p>
              <p className="text-slate-600 mt-1 font-medium">
                {format(startTime, "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </p>
              <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>{format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}</span>
                <span className="text-slate-300">|</span>
                <span>{booking.event_types?.duration_mins} min</span>
              </div>
            </div>
          </div>

          {/* Booker Info */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">Cliente</p>
              <p className="text-slate-700 mt-1 font-semibold text-lg">{booking.booker_name}</p>
              <div className="flex items-center gap-2 mt-1 text-blue-600 hover:underline cursor-pointer">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${booking.booker_email}`} className="text-sm font-medium">{booking.booker_email}</a>
              </div>
            </div>
          </div>

          {/* Payment/Billing Info */}
          {(booking.event_types?.requires_deposit || (booking.billing_info && Object.keys(booking.billing_info).length > 0)) && (
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">Información de Pago</p>
                {booking.event_types?.requires_deposit && (
                  <p className="text-slate-600 mt-1 text-sm">
                    Requiere depósito: <span className="font-bold text-slate-900">${booking.event_types.deposit_amount}</span> 
                    <span className="text-slate-400 mx-2">/</span> 
                    Total: <span className="font-bold text-slate-900">${booking.event_types.price}</span>
                  </p>
                )}
                {booking.billing_info && Object.keys(booking.billing_info).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Info className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Datos de facturación:</span>
                    </div>
                    <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap">
                      {JSON.stringify(booking.billing_info, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400 justify-center mt-4 pt-4 border-t border-slate-50">
             <span>ID de Reserva:</span>
             <code className="bg-slate-50 px-2 py-0.5 rounded">{booking.id}</code>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
