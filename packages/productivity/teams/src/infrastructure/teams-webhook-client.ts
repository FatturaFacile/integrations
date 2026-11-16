import { TeamsConfig, TeamsAdaptiveCard } from '../domain/types.js';

export class TeamsWebhookClient {
  constructor(private readonly config: TeamsConfig) {}

  public async sendCard(card: TeamsAdaptiveCard): Promise<void> {
    const res = await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });

    if (!res.ok) {
      throw new Error(`Teams webhook error [${res.status}]: ${res.statusText}`);
    }
  }
}
