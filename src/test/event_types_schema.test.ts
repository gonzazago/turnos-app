import { describe, it, expect } from 'vitest';
import { createClient } from '@/utils/supabase/client';

describe('Event Types Schema', () => {
  it('event_types should have total_price and deposit_percentage columns', async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('event_types')
      .select('total_price, deposit_percentage')
      .limit(1);

    if (error && error.code === '42703') { // undefined_column
       throw new Error('Columns total_price or deposit_percentage do not exist in event_types');
    }
    
    expect(error).toBeNull();
  });
});
