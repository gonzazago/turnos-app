'use client';

import { useState } from 'react';
import { format, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, User, AlertCircle, CheckCircle2, RefreshCcw } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { handleCancelBooking } from './actions';
import Link from 'next/link';

interface Props {
  booking: any;
  refundPercentage: number;
  refundAmount: number;
  token: string;
  rescheduleLimitHours: number;
}

export function CancellationClient({ booking, refundPercentage, refundAmount, token, rescheduleLimitHours }: Props) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTime = new Date(booking.start_time);
  const canReschedule = differenceInHours(startTime, new Date()) >= rescheduleLimitHours;
  
  const onCancel = async () => {
    setIsConfirming(true);
    setError(null);
    
    try {
      const result = await handleCancelBooking(booking.id, token);
      if ('success' in result && result.success) {
        setIsSuccess(true);
      } else if ('error' in result) {
        setError(result.error || 'Ocurrió un error al procesar la cancelación.');
      } else {
        setError('Ocurrió un error al procesar la cancelación.');
      }
    } catch (err) {
      setError('Error inesperado. Intenta nuevamente.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Cita cancelada con éxito</h2>
          <p className="text-slate-600 mb-8">
            Tu reserva ha sido eliminada. {refundAmount > 0 ? `Se ha procesado un reembolso de $${refundAmount.toFixed(2)} (${refundPercentage}%).` : 'Esta cancelación no incluye reembolso según las políticas del profesional.'}
          </p>
          <a 
            href="/" 
            className="block w-full py-4 px-6 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-slate-900 p-8 text-white">
        <h1 className="text-2xl font-bold mb-2">Cancelar Reserva</h1>
        <p className="text-slate-400">Por favor, confirma que deseas cancelar tu cita.</p>
      </div>

      <div className="p-8">
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            Detalles de la Reserva
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fecha</p>
                <p className="text-sm font-semibold text-slate-900 capitalize">
                  {format(startTime, "EEEE, d 'de' MMMM", { locale: es })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hora</p>
                <p className="text-sm font-semibold text-slate-900">
                  {format(startTime, "HH:mm")} hs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Servicio</p>
                <p className="text-sm font-semibold text-slate-900">
                  {booking.event_types?.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profesional</p>
                <p className="text-sm font-semibold text-slate-900">
                  {booking.profiles?.full_name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl mb-8 border ${refundPercentage > 0 ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
          <h4 className="font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Política de Reembolso
          </h4>
          <p className="text-sm leading-relaxed">
            {refundPercentage > 0 
              ? `De acuerdo a la política de cancelación, tienes derecho a un reembolso del ${refundPercentage}% del monto abonado ($${refundAmount.toFixed(2)}).`
              : 'Esta cita se encuentra fuera del periodo de reembolso permitido por el profesional.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="flex-1 py-4 px-6 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isConfirming ? <Spinner size="sm" color="white" /> : null}
            {isConfirming ? 'Procesando...' : 'Confirmar Cancelación'}
          </button>
          
          {canReschedule && (
            <Link
              href={`/${booking.profiles.slug}/${booking.event_type_id}?rescheduleId=${booking.id}&t=${token}`}
              className="flex-1 py-4 px-6 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all text-center flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" />
              Cambiar Fecha/Hora
            </Link>
          )}

          <a
            href="/"
            className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all text-center"
          >
            Mantener Cita
          </a>
        </div>
      </div>
    </div>
  );
}
