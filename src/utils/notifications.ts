export interface BookingConfirmationData {
  booker_name: string
  booker_email: string
  provider_name: string
  provider_email: string
  event_title: string
  start_time: string
  booking_id: string
  cancel_token: string
}

/**
 * Sends a booking confirmation email to both the booker and the provider.
 * This is a placeholder for a real notification service like Resend.
 */
export async function sendBookingConfirmation(data: BookingConfirmationData) {
  const cancelLink = `${process.env.NEXT_PUBLIC_APP_URL}/cancel/${data.booking_id}?t=${data.cancel_token}`

  console.log('--- SENDING BOOKING CONFIRMATION EMAILS ---')
  console.log(`To Booker: ${data.booker_email} (Hi ${data.booker_name}, your meeting '${data.event_title}' with ${data.provider_name} is confirmed!)`)
  console.log(`Cancellation Link: ${cancelLink}`)
  console.log(`To Provider: ${data.provider_email} (Hi ${data.provider_name}, ${data.booker_name} booked '${data.event_title}' with you!)`)
  console.log('-------------------------------------------')

  // In a real implementation, you would use a service like Resend here:
  // const res = await resend.emails.send({ ... })
  
  return { success: true }
}
