import { describe, it, expect } from 'vitest';
import { createClient } from '@/utils/supabase/client';

describe('Google Calendar Schema', () => {
  it('google_calendar_tokens should have user_id, access_token, refresh_token and expires_at columns', async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('google_calendar_tokens')
      .select('user_id, access_token, refresh_token, expires_at')
      .limit(1);

    if (error && error.code === 'PGRST116') { // no_rows
      expect(true).toBe(true);
      return;
    }

    if (error && error.code === '42P01') { // relation_does_not_exist
      throw new Error('Table google_calendar_tokens does not exist');
    }

    if (error && error.code === '42703') { // undefined_column
       throw new Error('Columns access_token or refresh_token or expires_at do not exist in google_calendar_tokens');
    }
    
    expect(error).toBeNull();
  });

  it('profiles should have google_calendar_connected column', async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('google_calendar_connected')
      .limit(1);

    if (error && error.code === '42703') { // undefined_column
       throw new Error('Column google_calendar_connected does not exist in profiles');
    }
    
    expect(error).toBeNull();
  });
});
