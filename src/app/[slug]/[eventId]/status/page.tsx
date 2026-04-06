import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, XCircle, Calendar, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { getSupabaseAdmin } from '@/utils/supabase/admin'

export default async function BookingStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; eventId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug, eventId } = await params
  const { status, bookingId } = await searchParams

  if (!bookingId) notFound()

  // Use Admin client to fetch booking details because public RLS might block SELECT
  const supabaseAdmin = getSupabaseAdmin()

  // Fetch booking details
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select('*, event_types(*), profiles(*)')
    .eq('id', bookingId)
    .single()

  if (error || !booking) notFound()

  const isSuccess = status === 'approved' || status === 'success' || booking.payment_status === 'paid'
  const startTime = parseISO(booking.start_time)

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl w-full">
        
        {/* Header Status */}
        <div className={`p-12 text-center flex flex-col items-center ${isSuccess ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
          {isSuccess ? (
            <>
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">¡Reserva confirmada!</h2>
              <p className="text-slate-600">Tu pago ha sido procesado correctamente.</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Pago pendiente o fallido</h2>
              <p className="text-slate-600">Hubo un problema al procesar el pago de la seña.</p>
            </>
          )}
        </div>

        {/* Booking Details */}
        <div className="p-8 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Resumen de la reserva</h3>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">Fecha y Hora</p>
                <p className="text-slate-600 mt-1 font-medium">
                  {format(startTime, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                </p>
                <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{format(startTime, 'HH:mm')}</span>
                  <span className="text-slate-300">|</span>
                  <span>{booking.event_types?.duration_mins} min</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">Evento y Profesional</p>
                <p className="text-slate-700 mt-1 font-semibold">{booking.event_types?.title}</p>
                <p className="text-slate-500 text-sm">con {booking.profiles?.full_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href={`/${slug}`}
            className="bg-white border border-slate-200 text-slate-700 font-bold px-8 py-3 rounded-xl hover:bg-slate-100 transition-all text-center"
          >
            Volver al inicio
          </Link>
          {isSuccess && (
            <button className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 text-center">
              Agendar en mi calendario
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
