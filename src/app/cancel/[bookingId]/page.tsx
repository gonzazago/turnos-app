import { notFound, redirect } from 'next/navigation';
import { verifyCancelToken } from '@/utils/tokens';
import { calculateRefund } from '@/utils/refunds';
import { CancellationClient } from './CancellationClient';
import { BookingService } from '@/services/booking/service';

interface Props {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function CancelPage({ params, searchParams }: Props) {
  const { bookingId } = await params;
  const { t: token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Enlace inválido</h1>
          <p className="text-slate-600 mb-6">No se proporcionó un token de cancelación válido.</p>
          <a href="/" className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl">
            Ir al inicio
          </a>
        </div>
      </div>
    );
  }

  // Verify token
  const isValidToken = verifyCancelToken(token, bookingId);
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Enlace expirado o inválido</h1>
          <p className="text-slate-600 mb-6">Este enlace de cancelación ya no es válido o ha expirado por razones de seguridad.</p>
          <a href="/" className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl">
            Ir al inicio
          </a>
        </div>
      </div>
    );
  }

  // Fetch booking with event and profile info
  let booking;
  try {
    booking = await BookingService.getById(bookingId);
  } catch (bookingError) {
    console.error('Error fetching booking for cancellation:', bookingError);
    notFound();
  }

  if (!booking) {
    notFound();
  }

  if (booking.status === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Cita ya cancelada</h1>
          <p className="text-slate-600 mb-6">Esta reserva ya ha sido cancelada previamente.</p>
          <a href="/" className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl">
            Ir al inicio
          </a>
        </div>
      </div>
    );
  }

  // Calculate refund
  const refundRules = booking.profiles?.refund_rules || [];
  const appointmentTime = new Date(booking.start_time);
  const refundInfo = calculateRefund(refundRules, appointmentTime);

  // Calculate refund amount
  let totalPaid = 0;
  if (booking.event_types?.requires_deposit) {
    totalPaid = (Number(booking.event_types.total_price) * Number(booking.event_types.deposit_percentage)) / 100;
  }
  
  const refundAmount = (totalPaid * refundInfo.percentage) / 100;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <CancellationClient 
        booking={booking} 
        refundPercentage={refundInfo.percentage}
        refundAmount={refundAmount}
        token={token}
      />
    </div>
  );
}
