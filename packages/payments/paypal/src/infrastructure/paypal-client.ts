import { PayPalConfig, PayPalCapture } from '../domain/types.js';

export class PayPalClient {
  private readonly baseUrl: string;

  constructor(private readonly config: PayPalConfig) {
    this.baseUrl = config.mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  }

  public async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!res.ok) {
      throw new Error(`PayPal OAuth error [${res.status}]: ${res.statusText}`);
    }

    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  }

  public async getCapture(captureId: string): Promise<PayPalCapture> {
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}/v2/payments/captures/${captureId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`PayPal capture lookup error [${res.status}]: ${res.statusText}`);
    }

    return (await res.json()) as PayPalCapture;
  }
}
