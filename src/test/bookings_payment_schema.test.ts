import { describe, it, expect } from 'vitest';
import { createClient } from '@/utils/supabase/client';

describe('Bookings Payment Schema', () => {
  it('bookings should have payment_status and mercado_pago_preference_id columns', async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('bookings')
      .select('payment_status, mercado_pago_preference_id')
      .limit(1);

    if (error && error.code === '42703') { // undefined_column
       throw new Error('Columns payment_status or mercado_pago_preference_id do not exist in bookings');
    }
    
    expect(error).toBeNull();
  });
});
