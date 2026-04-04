import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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
    
    // We use upsert on the unique constraint (provider, provider_user_id)
    return supabase
      .from('payment_accounts')
      .upsert(
        {
          ...account,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'provider, provider_user_id' }
      )
      .select()
      .single();
  },

  async saveAccountAdmin(account: PaymentAccount) {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    return supabaseAdmin
      .from('payment_accounts')
      .upsert(
        {
          ...account,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'provider, provider_user_id' }
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

  async getActiveAccountAdmin(userId: string, provider: string) {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    return supabaseAdmin
      .from('payment_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true)
      .single();
  },

  async refreshTokenIfNeeded(accountId: string) {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch the account
    const { data: account, error: fetchError } = await supabaseAdmin
      .from('payment_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (fetchError || !account) {
      throw new Error('Payment account not found');
    }

    // 2. Check if it needs refresh (if expires_at exists and is within 10 minutes of now)
    const expiresAt = account.expires_at ? new Date(account.expires_at) : null;
    const now = new Date();
    const buffer = 10 * 60 * 1000; // 10 minutes buffer

    if (!expiresAt || expiresAt.getTime() - now.getTime() > buffer) {
      // Token is still valid, return it
      return account.access_token;
    }

    if (!account.refresh_token) {
      throw new Error('No refresh token available for this account');
    }

    console.log('Refreshing Mercado Pago token for account:', accountId);

    try {
      // 3. Call Mercado Pago API to refresh
      const response = await fetch('https://api.mercadopago.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          client_secret: process.env.MP_CLIENT_SECRET || '',
          client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID || '',
          grant_type: 'refresh_token',
          refresh_token: account.refresh_token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to refresh MP token:', data);
        throw new Error('Failed to refresh Mercado Pago token');
      }

      // 4. Update the database with new tokens
      const newExpiresAt = new Date();
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + data.expires_in);

      const { data: updatedAccount, error: updateError } = await supabaseAdmin
        .from('payment_accounts')
        .update({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: newExpiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', accountId)
        .select()
        .single();

      if (updateError) throw updateError;

      return updatedAccount.access_token;

    } catch (err) {
      console.error('Error refreshing token:', err);
      throw err;
    }
  }
};
