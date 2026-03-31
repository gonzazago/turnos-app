import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { BookingClient } from './BookingClient'
import { startOfDay, addDays } from 'date-fns'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, slug')
    .eq('slug', slug)
    .single()

  if (!profile) {
    notFound()
  }

  const { data: eventType } = await supabase
    .from('event_types')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', profile.id)
    .single()

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
  const { data: bookedData } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('user_id', profile.id)
    .gte('end_time', startOfDay(new Date()).toISOString())
    .lt('start_time', addDays(new Date(), 15).toISOString())

  return <BookingClient 
    profile={profile} 
    eventType={eventType} 
    bookedSlots={bookedData || []} 
    availability={availability || []}
  />
}
