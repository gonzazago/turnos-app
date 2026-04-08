export interface PaymentItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

export interface PayerInfo {
  name: string;
  email: string;
}

export interface PaymentPreferenceOptions {
  external_reference: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  notification_url?: string;
  auto_return?: 'approved' | 'all';
}

export interface WebhookValidationResult {
  isValid: boolean;
  id?: string;
  type?: string;
  payload?: any;
}

export interface OAuthExchangeResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  provider_user_id: string;
}

export interface PaymentProvider {
  name: string;
  
  createPreference(
    accessToken: string,
    items: PaymentItem[],
    payer: PayerInfo,
    options: PaymentPreferenceOptions
  ): Promise<{ id: string; init_point: string }>;

  validateWebhook(
    headers: Record<string, string | null>,
    body: any,
    webhookSecret?: string
  ): Promise<WebhookValidationResult>;

  getPaymentDetails(accessToken: string, paymentId: string): Promise<any>;

  exchangeAuthorizationCode(code: string, redirectUri: string): Promise<OAuthExchangeResult>;

  refreshToken(refreshToken: string): Promise<OAuthExchangeResult>;

  refundPayment(accessToken: string, paymentId: string, amount?: number): Promise<any>;
}
