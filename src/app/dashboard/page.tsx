import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { subMonths, addMonths } from 'date-fns'
import { ClientDashboard } from './components/ClientDashboard'

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
      id, start_time, end_time, booker_name, booker_email, status, payment_status,
      event_types (title, duration_mins, requires_deposit, total_price, deposit_percentage)
    `)
    .eq('user_id', user.id)
    .gte('start_time', subMonths(new Date(), 3).toISOString())
    .lte('start_time', addMonths(new Date(), 6).toISOString())
    .order('start_time', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tu Panel</h1>
        <p className="text-slate-500 mt-1">Gestiona tus citas y visualiza tu disponibilidad.</p>
      </div>

      <ClientDashboard bookings={bookings || []} />
    </div>
  )
}
