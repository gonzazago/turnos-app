import { describe, it, expect } from 'vitest';
import { createClient } from '@/utils/supabase/client';

describe('Mercado Pago Schema', () => {
  it('profiles should have mp_access_token and mp_public_key columns', async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('mp_access_token, mp_public_key')
      .limit(1);

    if (error && error.code === '42703') { // undefined_column
       throw new Error('Columns mp_access_token or mp_public_key do not exist in profiles');
    }
    
    expect(error).toBeNull();
  });
});
