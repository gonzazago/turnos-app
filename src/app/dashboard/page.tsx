import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ClientDashboard } from './components/ClientDashboard'
import { BookingService } from '@/services/booking/service'
import { OnboardingModal } from './OnboardingModal'

export const metadata = { title: 'Dashboard - Turnos' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch recent history and future appointments efficiently (from -3M to +6M)
  const bookings = await BookingService.getProviderDashboardBookings(user.id)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tu Panel</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Gestiona tus citas y visualiza tu disponibilidad.</p>
      </div>

      <ClientDashboard bookings={bookings || []} />

      <OnboardingModal />
    </div>
  )
}
