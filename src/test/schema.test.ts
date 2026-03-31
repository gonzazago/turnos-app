import { describe, it, expect } from 'vitest';
import { createClient } from '@/utils/supabase/client';

describe('Database Schema', () => {
  it('event_types should have requires_deposit, total_price, and deposit_percentage columns', async () => {
    const supabase = createClient();
    
    // We try to fetch the columns or insert a dummy to see if it fails/succeeds
    // Since we are in a real DB environment usually, we can check table info or just try a select
    const { data, error } = await supabase
      .from('event_types')
      .select('requires_deposit, total_price, deposit_percentage')
      .limit(1);

    if (error && error.code === '42703') { // undefined_column
       // This is what we expect before migration (Red phase)
       throw new Error('Columns requires_deposit, total_price, or deposit_percentage do not exist in event_types');
    }
    
    // If it exists, we just expect no error (Green phase)
    expect(error).toBeNull();
  });

  it('bookings should have billing_info column', async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('billing_info')
      .limit(1);

    if (error && error.code === '42703') {
       throw new Error('Column billing_info does not exist in bookings');
    }
    expect(error).toBeNull();
  });
});
