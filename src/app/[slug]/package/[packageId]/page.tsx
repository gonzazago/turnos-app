import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { PackageClient } from './PackageClient'
import { startOfDay, addDays } from 'date-fns'
import { getARHolidays } from '@/utils/holidays'
import { BookingService } from '@/services/booking/service'
import { CalendarService } from '@/services/calendar/service'

export async function generateMetadata({ params }: { params: Promise<{ slug: string, packageId: string }> }) {
    console.log(params)
    const { slug, packageId } = await params

  const supabase = await createClient()

  const { data: pkg } = await supabase
    .from('session_packages')
    .select('name')
    .eq('id', packageId)
    .single()

  return { title: pkg ? `Comprar ${pkg.name}` : 'Paquete no encontrado' }
}

export default async function PackagePublicPage({ params }: { params: Promise<{ slug: string, packageId: string }> }) {
  const { slug, packageId } = await params
  const supabase = await createClient()

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, slug, brand_color, plan_type')
    .eq('slug', slug)
    .single()

  if (!profile) return notFound()

  // 2. Fetch Package
  const { data: pkg, error: pkgError } = await supabase
    .from('session_packages')
    .select('*, event_types!left(id, title, duration_mins)')
    .eq('id', packageId)
    .eq('provider_id', profile.id)
    .single()

  if (pkgError) {
     console.error("Error fetching package details:", pkgError)
  }

  if (!pkg) {
     console.warn(`Package ${packageId} not found for profile ${profile.id}. 404 Triggered.`)
     return notFound()
  }

  // 3. If "fijo", we need availability just like a booking
  let availability: any[] = []
  let bookedSlots: any[] = []
  let googleBusySlots: any[] = []

  if (pkg.scheduling_type === 'fijo') {
    // Fetch provider's availability for this specific event type (or global if null)
    const availabilityQuery = supabase
      .from('availability')
      .select('*')
      .eq('user_id', profile.id)
    
    if (pkg.event_type_id) {
       availabilityQuery.eq('event_type_id', pkg.event_type_id)
    }
    
    const { data: availabilityData } = await availabilityQuery
    availability = availabilityData || []

    // Fetch upcoming booked slots for the next 60 days
    try {
      const bookedData = await BookingService.getOverlappingBookings(
        profile.id,
        startOfDay(new Date()).toISOString(),
        addDays(new Date(), 60).toISOString()
      );
      bookedSlots = bookedData || [];
    } catch (err) {
      console.error('Error fetching bookings for package', err);
    }

    // Fetch Google busy slots
    const { data: googleBusyData } = await supabase
      .from('google_busy_slots')
      .select('start_time, end_time')
      .eq('user_id', profile.id)
      .gte('end_time', startOfDay(new Date()).toISOString())
      .lt('start_time', addDays(new Date(), 60).toISOString())
      
    googleBusySlots = googleBusyData || []
    
    // Nager.Date Holidays for Pro/Ultra
    const hasGoogleCalendar = await CalendarService.hasGoogleCalendarConnection(profile.id);

    if (!hasGoogleCalendar && profile && (profile.plan_type === 'pro' || profile.plan_type === 'ultra')) {
      const currentYear = new Date().getFullYear();
      const holidays = await getARHolidays(currentYear);
      googleBusySlots = [...googleBusySlots, ...holidays];
    }
  }

  return (
    <PackageClient 
      profile={profile} 
      pkg={pkg} 
      availability={availability}
      bookedSlots={bookedSlots}
      googleBusySlots={googleBusySlots}
    />
  )
}
