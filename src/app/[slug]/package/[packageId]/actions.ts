'use server'

import { createClient } from '@/utils/supabase/server'
import { PaymentService } from '@/services/payment/service'

export async function purchasePackage(formData: FormData) {
  const supabase = await createClient()

  const profileId = formData.get('profileId') as string
  const packageId = formData.get('packageId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const startTime = formData.get('startTime') as string // optional
  const durationMinsStr = formData.get('durationMins') as string // optional
  const sessionCount = parseInt(formData.get('sessionCount') as string)
  const price = parseFloat(formData.get('price') as string)
  const sessionDatesRaw = formData.get('sessionDates') as string // JSON array of ISO strings

  try {
    const { data: pkg } = await supabase
      .from('session_packages')
      .select('*')
      .eq('id', packageId)
      .single()

    if (!pkg) {
      return { error: 'Paquete no encontrado.' }
    }

    const packageGroupId = crypto.randomUUID()
    
    // IF FIJO: Pre-insert bookings to block slots
    if (pkg.scheduling_type === 'fijo' && sessionDatesRaw) {
      const dates = JSON.parse(sessionDatesRaw) as string[]
      const duration = parseInt(durationMinsStr || '60')

      const bookingsToInsert = dates.map(dateStr => {
        const start = new Date(dateStr)
        const end = new Date(start.getTime() + duration * 60000)
        return {
          user_id: profileId,
          event_type_id: pkg.event_type_id,
          booker_name: name,
          booker_email: email,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          status: 'pending_payment',
          payment_status: 'pending',
          package_group_id: packageGroupId
        }
      })

      const { error: insertError } = await supabase
        .from('bookings')
        .insert(bookingsToInsert)

      if (insertError) {
        if (insertError.code === '23P01') {
          return { error: 'Uno de los horarios seleccionados ya no está disponible. Por favor, intenta con otro horario de inicio.' }
        }
        throw insertError
      }
    }

    // Connect to Mercado Pago
    const accessToken = await PaymentService.getValidAccessToken(profileId, 'mercadopago')
    const mpProvider = PaymentService.getProvider('mercadopago')
    
    // Create external_reference format:
    // Format: PKGLIBRE|packageId|profileId|btoa(email)|sessionCount|price
    // Format: PKGFIJO|packageId|profileId|btoa(email)|packageGroupId|price
    let extRef = `PKGLIBRE|${packageId}|${profileId}|${Buffer.from(email).toString('base64')}|${sessionCount}|${price}`
    if (pkg.scheduling_type === 'fijo') {
      extRef = `PKGFIJO|${packageId}|${profileId}|${Buffer.from(email).toString('base64')}|${packageGroupId}|${price}`
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('slug, full_name')
      .eq('id', profileId)
      .single()

    const preference = await mpProvider.createPreference(
      accessToken,
      [{
        id: pkg.id,
        title: `Paquete: ${pkg.name} (${sessionCount} ses.)`,
        description: `Adquisición de ${sessionCount} sesiones con ${profile?.full_name || 'profesional'}`,
        quantity: 1,
        unit_price: price,
      }],
      { name: name, email: email },
      {
        external_reference: extRef,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/${profile?.slug}/package/${packageId}/status?status=success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/${profile?.slug}/package/${packageId}/status?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/${profile?.slug}/package/${packageId}/status?status=pending`,
        },
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      }
    )

    return { success: true, checkoutUrl: preference.init_point }

  } catch (error: any) {
    console.error('Purchase error:', error)
    return { error: 'No se pudo generar el link de pago. ' + (error.message || '') }
  }
}
