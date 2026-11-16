import { StripeConfig, StripePaymentIntent } from '../domain/types.js';

export class StripeClient {
  private readonly baseUrl = 'https://api.stripe.com/v1';

  constructor(private readonly config: StripeConfig) {}

  public async getPaymentIntent(id: string): Promise<StripePaymentIntent> {
    const res = await fetch(`${this.baseUrl}/payment_intents/${id}`, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Stripe API error [${res.status}]: ${res.statusText}`);
    }

    return (await res.json()) as StripePaymentIntent;
  }
}
