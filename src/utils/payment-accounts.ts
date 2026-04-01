import { createClient } from '@/utils/supabase/server';

export interface PaymentAccount {
  id?: string;
  user_id: string;
  provider: string;
  provider_user_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const PaymentAccountService = {
  async saveAccount(account: PaymentAccount) {
    const supabase = await createClient();
    
    // We use upsert on the unique constraint (user_id, provider, provider_user_id)
    return supabase
      .from('payment_accounts')
      .upsert(
        {
          ...account,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, provider, provider_user_id' }
      )
      .select()
      .single();
  },

  async getActiveAccount(userId: string, provider: string) {
    const supabase = await createClient();
    
    return supabase
      .from('payment_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true)
      .single();
  },

  async refreshTokenIfNeeded(accountId: string) {
    // Phase 3 implementation
    throw new Error('Not implemented');
  }
};
