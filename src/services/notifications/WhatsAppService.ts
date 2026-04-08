export interface WhatsAppProvider {
  sendMessage(toPhone: string, message: string): Promise<boolean>;
  sendTemplate(toPhone: string, templateName: string, parameters: Record<string, string>): Promise<boolean>;
}

export class DummyWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(toPhone: string, message: string): Promise<boolean> {
    console.log(`[DUMMY WHATSAPP] To: ${toPhone} | Message: ${message}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }

  async sendTemplate(toPhone: string, templateName: string, parameters: Record<string, string>): Promise<boolean> {
    console.log(`[DUMMY WHATSAPP] To: ${toPhone} | Template: ${templateName} | Params:`, parameters);
    return true;
  }
}

export class TwilioWhatsAppProvider implements WhatsAppProvider {
  private accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  private authToken = process.env.TWILIO_AUTH_TOKEN || '';
  private fromPhone = process.env.TWILIO_FROM_PHONE || '';

  async sendMessage(toPhone: string, message: string): Promise<boolean> {
    if (!this.accountSid || !this.authToken || !this.fromPhone) {
      console.warn('[TWILIO] Missing credentials, falling back to console log');
      console.log(`[TWILIO SIMULATION] To: ${toPhone} | Message: ${message}`);
      return true;
    }

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(this.accountSid + ':' + this.authToken).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${this.fromPhone}`,
            To: `whatsapp:${toPhone}`,
            Body: message,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[TWILIO] Error sending message:', errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[TWILIO] Unexpected error:', error);
      return false;
    }
  }

  async sendTemplate(toPhone: string, templateName: string, parameters: Record<string, string>): Promise<boolean> {
    // Twilio WhatsApp templates are usually sent as Body content if pre-registered
    // or using the ContentSid for specific template APIs.
    // For simplicity, we'll just log it.
    console.log(`[TWILIO TEMPLATE] To: ${toPhone} | Template: ${templateName} | Params:`, parameters);
    return true;
  }
}

// Factory
export class WhatsAppService {
  private static provider: WhatsAppProvider = process.env.TWILIO_ACCOUNT_SID 
    ? new TwilioWhatsAppProvider() 
    : new DummyWhatsAppProvider();

  public static setProvider(provider: WhatsAppProvider) {
    this.provider = provider;
  }

  public static async sendBookingConfirmation(toPhone: string, date: string, profesional: string) {
    return this.provider.sendMessage(
      toPhone,
      `¡Hola! Tu turno con ${profesional} el día ${date} ha sido confirmado con éxito. ¡Te esperamos!`
    );
  }

  public static async sendReminder(toPhone: string, date: string, profesional: string) {
    return this.provider.sendMessage(
      toPhone,
      `¡Hola! Te recordamos que mañana (${date}) tienes un turno con ${profesional}. ¡No faltes!`
    );
  }

  public static async sendBookingCancellation(toPhone: string, cliente: string, date: string) {
    return this.provider.sendMessage(
      toPhone,
      `Aviso: El cliente ${cliente} ha cancelado su turno del día ${date}. El horario ya está disponible nuevamente.`
    );
  }
}
