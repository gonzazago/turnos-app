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

// Factory
export class WhatsAppService {
  private static provider: WhatsAppProvider = new DummyWhatsAppProvider();

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
