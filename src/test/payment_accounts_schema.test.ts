import { describe, it, expect } from 'vitest';
import { createClient } from '@/utils/supabase/client';

describe('Payment Accounts Schema', () => {
  it('payment_accounts should have required columns', async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('payment_accounts')
      .select('id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, is_active, created_at, updated_at')
      .limit(1);

    if (error && error.code === '42P01') { // undefined_table
       throw new Error('Table payment_accounts does not exist');
    }
    
    expect(error).toBeNull();
  });
});
