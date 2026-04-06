import { 
  PaymentProvider, 
  PaymentItem, 
  PayerInfo, 
  PaymentPreferenceOptions, 
  WebhookValidationResult,
  OAuthExchangeResult 
} from './provider';
import crypto from 'crypto';

export class MercadoPagoProvider implements PaymentProvider {
  name = 'mercadopago';

  private clientId = process.env.MP_CLIENT_ID || '';
  private clientSecret = process.env.MP_CLIENT_SECRET || '';

  async createPreference(
    accessToken: string,
    items: PaymentItem[],
    payer: PayerInfo,
    options: PaymentPreferenceOptions
  ): Promise<{ id: string; init_point: string }> {
    const payload = {
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        currency_id: 'ARS',
        unit_price: item.unit_price,
      })),
      payer: {
        name: payer.name,
        email: payer.email,
      },
      back_urls: options.back_urls,
      auto_return: options.auto_return || 'approved',
      notification_url: options.notification_url,
      external_reference: options.external_reference,
      statement_descriptor: 'TURNOS APP',
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago Preference Error:', data);
      throw new Error('Failed to create Mercado Pago preference');
    }

    return {
      id: data.id,
      init_point: data.init_point,
    };
  }

  async validateWebhook(
    headers: Record<string, string | null>,
    body: any,
    webhookSecret?: string
  ): Promise<WebhookValidationResult> {
    const signatureHeader = headers['x-signature'];
    
    // We expect certain fields in the URL or body for signature validation
    // Mercado Pago often sends data.id and type in the URL
    const id = body.data?.id || body.id;
    const type = body.type || body.topic;

    if (webhookSecret && signatureHeader) {
      const parts = signatureHeader.split(',');
      const tsPart = parts.find(p => p.trim().startsWith('ts='));
      const v1Part = parts.find(p => p.trim().startsWith('v1='));

      if (tsPart && v1Part) {
        const ts = tsPart.split('=')[1];
        const v1 = v1Part.split('=')[1];
        
        const manifest = `id:${id};topic:${type};ts:${ts};`;
        const hmac = crypto.createHmac('sha256', webhookSecret);
        hmac.update(manifest);
        const hash = hmac.digest('hex');

        if (hash !== v1) {
          return { isValid: false };
        }
      }
    }

    return {
      isValid: true,
      id,
      type,
      payload: body
    };
  }

  async getPaymentDetails(accessToken: string, paymentId: string): Promise<any> {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago Payment Details Error:', data);
      throw new Error('Failed to fetch payment details from Mercado Pago');
    }

    return data;
  }

  async exchangeAuthorizationCode(code: string, redirectUri: string): Promise<OAuthExchangeResult> {
    const payload = {
      client_secret: this.clientSecret,
      client_id: this.clientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    };

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago OAuth Exchange Error:', data);
      throw new Error('Failed to exchange Mercado Pago authorization code');
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      provider_user_id: String(data.user_id),
    };
  }

  async refreshToken(refreshToken: string): Promise<OAuthExchangeResult> {
    const payload = {
      client_secret: this.clientSecret,
      client_id: this.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago Token Refresh Error:', data);
      throw new Error('Failed to refresh Mercado Pago token');
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      provider_user_id: String(data.user_id),
    };
  }
}
