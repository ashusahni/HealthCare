export class WhatsAppService {
  private static instance: WhatsAppService | null = null;
  private readonly PHONE_NUMBER_ID = '584744444726098';
  private readonly API_URL = 'https://graph.facebook.com/v17.0';

  private constructor() {}

  static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  private async makeRequest(endpoint: string, data: any): Promise<Response> {
    const url = `${this.API_URL}/${this.PHONE_NUMBER_ID}${endpoint}`;
    const apiKey = process.env.NEXT_PUBLIC_WHATSAPP_API_KEY;

    if (!apiKey) {
      throw new Error('WhatsApp API key not configured');
    }

    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      // Format phone number to ensure it includes country code
      const formattedPhone = to.startsWith('+') ? to.substring(1) : to;
      
      const response = await this.makeRequest('/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WhatsApp API error:', errorData);
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('WhatsApp message sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  async sendMedicationMissedMessage(
    to: string,
    medicationName: string,
    scheduledTime: string,
    patientName: string = 'The patient'
  ): Promise<boolean> {
    try {
      const message = `🚨 Medication Alert!\n\n${patientName} missed their medication:\n\n` +
        `💊 Medication: ${medicationName}\n` +
        `⏰ Scheduled Time: ${scheduledTime}\n\n` +
        `Please check on them to ensure they're okay and remind them to take their medication.\n\n` +
        `This is an automated message from MediTrack.`;

      const success = await this.sendMessage(to, message);
      
      if (success) {
        console.log(`Successfully sent missed medication alert to ${to}`);
      } else {
        console.error(`Failed to send missed medication alert to ${to}`);
      }

      return success;
    } catch (error) {
      console.error('Error sending medication missed message:', error);
      return false;
    }
  }

  async sendTestMessage(to: string): Promise<boolean> {
    const message = '👋 Hello! This is a test message from MediTrack. ' +
      'You will receive medication alerts at this number when needed.';
    return this.sendMessage(to, message);
  }
} 