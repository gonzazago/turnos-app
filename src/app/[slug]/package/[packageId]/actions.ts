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

  try {
    const { data: pkg } = await supabase
      .from('session_packages')
      .select('*')
      .eq('id', packageId)
      .single()

    if (!pkg) {
      return { error: 'Paquete no encontrado.' }
    }

    // Connect to Mercado Pago
    const accessToken = await PaymentService.getValidAccessToken(profileId, 'mercadopago')
    const mpProvider = PaymentService.getProvider('mercadopago')
    
    // Create external_reference format:
    // Format: PKGLIBRE|packageId|profileId|btoa(email)
    // Format: PKGFIJO|packageId|profileId|btoa(email)|startTimeISO|duration
    let extRef = `PKGLIBRE|${packageId}|${profileId}|${Buffer.from(email).toString('base64')}`
    if (pkg.scheduling_type === 'fijo') {
      extRef = `PKGFIJO|${packageId}|${profileId}|${Buffer.from(email).toString('base64')}|${startTime}|${durationMinsStr}`
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
        title: `Paquete: ${pkg.name}`,
        description: `Adquisición de ${pkg.session_count} sesiones con ${profile?.full_name || 'profesional'}`,
        quantity: 1,
        unit_price: Number(pkg.total_price),
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
