'use server';

import { CancellationService } from '@/services/booking/cancellation';
import { revalidatePath } from 'next/cache';

export async function handleCancelBooking(bookingId: string, token: string) {
  try {
    const result = await CancellationService.processCancellation(
      bookingId,
      'client',
      token
    );

    revalidatePath('/dashboard');
    revalidatePath('/'); // To update availability on home/slug pages if needed
    
    return result;
  } catch (error: any) {
    console.error('Cancellation error:', error);
    return { error: error.message || 'Error al procesar la cancelación.' };
  }
}
