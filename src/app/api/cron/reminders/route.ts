import {NextResponse} from 'next/server';
import {WhatsAppService} from '@/services/notifications/WhatsAppService';
import {BookingService} from '@/services/booking/service';
import {addDays, endOfDay, startOfDay} from 'date-fns';

export async function GET(request: Request) {
  // En producción, aquí se valida un token secreto provisto por el servicio de cron (ej. Vercel Cron, Google Cloud Scheduler)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("Unauthorized cron invocation");
    // Comentado para permitir testing local, pero vital en prod:
    // return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Buscar turnos que ocurren mañana
    const tomorrowStart = startOfDay(addDays(new Date(), 1)).toISOString();
    const tomorrowEnd = endOfDay(addDays(new Date(), 1)).toISOString();

    // Esta query debería ser optimizada para ignorar turnos ya recordados si en el db hubiera un flag 'reminder_sent'
    const bookings = await BookingService.getUpcomingBookingsForReminders(tomorrowStart, tomorrowEnd);

    let sentCount = 0;

    for (const booking of bookings || []) {
      const profile = booking.profiles as any; // Cast for TS

      if (profile.plan_type === 'ultra' && profile.phone) {
        await WhatsAppService.sendReminder(
          profile.phone,
          new Date(booking.start_time).toLocaleString(),
          profile.full_name || 'Alguien'
        );
        sentCount++;
      }
    }

    return NextResponse.json({ success: true, remindersSent: sentCount });

  } catch (err: any) {
    console.error('Error in cron job:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
