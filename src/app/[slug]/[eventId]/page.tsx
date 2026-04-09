import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { BookingClient } from './BookingClient'
import { startOfDay, addDays } from 'date-fns'
import { getARHolidays } from '@/utils/holidays'
import { BookingService } from '@/services/booking/service'
import { CalendarService } from '@/services/calendar/service'

type Params = { slug: string; eventId: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug, eventId } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('slug', slug)
    .single()

  const { data: eventType } = await supabase
    .from('event_types')
    .select('title')
    .eq('id', eventId)
    .single()

  if (!profile || !eventType) return { title: 'No encontrado' }

  return { title: `Agendar ${eventType.title} con ${profile.full_name}`, description: 'Selecciona una hora para tu reunión.' }
}

export default async function BookingPage({ params }: { params: Promise<Params> }) {
  const { slug, eventId } = await params
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, slug, plan_type')
    .eq('slug', slug)
    .single()

  // Chequeo de integración de Google Calendar
  const hasGoogleCalendar = profile ? await CalendarService.hasGoogleCalendarConnection(profile.id) : false;

  if (profileError) {
    console.error("Error fetching profile in eventId page:", profileError);
  }

  if (!profile) {
    notFound()
  }

  const { data: eventType, error: eventTypeError } = await supabase
    .from('event_types')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', profile.id)
    .single()

  if (eventTypeError) {
    console.error("Error fetching eventType:", eventTypeError);
  }

  if (!eventType) {
    notFound()
  }

  // Fetch provider's availability for this specific event type
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('user_id', profile.id)
    .eq('event_type_id', eventId)

  // Fetch upcoming booked slots for the next 14 days
  let bookedData: any[] = [];
  try {
    bookedData = await BookingService.getOverlappingBookings(
      profile.id,
      startOfDay(new Date()).toISOString(),
      addDays(new Date(), 15).toISOString()
    );
  } catch (err) {
    console.error('Error fetching bookings', err);
  }

  // Fetch Google busy slots
  const { data: googleBusyData } = await supabase
    .from('google_busy_slots')
    .select('start_time, end_time')
    .eq('user_id', profile.id)
    .gte('end_time', startOfDay(new Date()).toISOString())
    .lt('start_time', addDays(new Date(), 15).toISOString())
    
  let allBusySlots = googleBusyData || [];
  
  // Nager.Date Holidays for Pro/Ultra if no Google Calendar connected
  if (!hasGoogleCalendar && profile && (profile.plan_type === 'pro' || profile.plan_type === 'ultra')) {
    const currentYear = new Date().getFullYear();
    const holidays = await getARHolidays(currentYear);
    allBusySlots = [...allBusySlots, ...holidays];
  }

  return <BookingClient 
    profile={profile} 
    eventType={eventType} 
    bookedSlots={bookedData || []} 
    availability={availability || []}
    googleBusySlots={allBusySlots}
  />
}
