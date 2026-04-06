import { MercadoPagoProvider } from './mercadopago';
import { PaymentProvider } from './provider';
import { getSupabaseAdmin } from '@/utils/supabase/admin';
import { encryptToken, decryptToken } from '@/utils/crypto';

export class PaymentService {
  private static providers: Record<string, PaymentProvider> = {
    mercadopago: new MercadoPagoProvider(),
  };

  static getProvider(name: string): PaymentProvider {
    const provider = this.providers[name];
    if (!provider) {
      throw new Error(`Payment provider ${name} not supported`);
    }
    return provider;
  }

  static async getActiveAccount(userId: string, providerName: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: account, error } = await supabaseAdmin
      .from('payment_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', providerName)
      .eq('is_active', true)
      .single();

    if (error || !account) return null;
    
    // Decrypt tokens
    if (account.access_token) account.access_token = decryptToken(account.access_token);
    if (account.refresh_token) account.refresh_token = decryptToken(account.refresh_token);

    return account;
  }

  static async getAccountByProviderId(providerName: string, providerUserId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: account, error } = await supabaseAdmin
      .from('payment_accounts')
      .select('*')
      .eq('provider', providerName)
      .eq('provider_user_id', providerUserId)
      .eq('is_active', true)
      .single();

    if (error || !account) return null;

    // Decrypt tokens
    if (account.access_token) account.access_token = decryptToken(account.access_token);
    if (account.refresh_token) account.refresh_token = decryptToken(account.refresh_token);

    return account;
  }

  static async saveAccount(accountData: {
    user_id: string;
    provider: string;
    provider_user_id: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
    is_active?: boolean;
  }) {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Encrypt sensitive data before sending to the database
    const secureData = { ...accountData };
    if (secureData.access_token) secureData.access_token = encryptToken(secureData.access_token);
    if (secureData.refresh_token) secureData.refresh_token = encryptToken(secureData.refresh_token);

    return supabaseAdmin
      .from('payment_accounts')
      .upsert(
        {
          ...secureData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'provider, provider_user_id' }
      )
      .select()
      .single();
  }

  static async getValidAccessToken(userId: string, providerName: string): Promise<string> {
    const account = await this.getActiveAccount(userId, providerName);
    if (!account) {
      throw new Error(`No active payment account found for user ${userId} and provider ${providerName}`);
    }

    const expiresAt = account.expires_at ? new Date(account.expires_at) : null;
    const now = new Date();
    const buffer = 10 * 60 * 1000; // 10 minutes

    if (!expiresAt || expiresAt.getTime() - now.getTime() > buffer) {
      return account.access_token;
    }

    // Refresh token if expired or about to expire
    const provider = this.getProvider(providerName);
    if (!account.refresh_token) {
      throw new Error('No refresh token available');
    }

    const result = await provider.refreshToken(account.refresh_token);
    
    const newExpiresAt = new Date();
    newExpiresAt.setSeconds(newExpiresAt.getSeconds() + result.expires_in);

    await this.saveAccount({
      user_id: userId,
      provider: providerName,
      provider_user_id: result.provider_user_id,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_at: newExpiresAt.toISOString(),
      is_active: true,
    });

    return result.access_token;
  }
}
