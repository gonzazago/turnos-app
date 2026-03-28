import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { subMonths, addMonths } from 'date-fns'
import { DashboardCalendar } from './components/DashboardCalendar'

export const metadata = { title: 'Dashboard - Turnos' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch recent history and future appointments efficiently (from -3M to +6M)
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, start_time, end_time, booker_name, booker_email, status,
      event_types (title, duration_mins)
    `)
    .eq('user_id', user.id)
    .gte('start_time', subMonths(new Date(), 3).toISOString())
    .lte('start_time', addMonths(new Date(), 6).toISOString())
    .order('start_time', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Tu Calendario</h1>
        <p className="text-slate-500 mt-1">Gestiona y visualiza tus citas de forma interactiva.</p>
      </div>

      <DashboardCalendar bookings={bookings || []} />
    </div>
  )
}
