import { describe, it, expect } from 'vitest';
import { createClient } from '@/utils/supabase/client';

describe('Mercado Pago Schema', () => {
  it('payment_accounts should have access_token and refresh_token columns', async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('payment_accounts')
      .select('access_token, refresh_token')
      .limit(1);

    if (error && error.code === '42703') { // undefined_column
       throw new Error('Columns access_token or refresh_token do not exist in payment_accounts');
    }
    
    expect(error).toBeNull();
  });
});
