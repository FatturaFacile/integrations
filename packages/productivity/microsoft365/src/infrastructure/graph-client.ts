import { Microsoft365Config, M365EmailMessage, M365CalendarEvent } from '../domain/types.js';

export class MicrosoftGraphClient {
  private readonly baseUrl = 'https://graph.microsoft.com/v1.0';

  constructor(
    private readonly config: Microsoft365Config,
    private readonly tokenProvider?: () => Promise<string>
  ) {}

  private async getHeaders(): Promise<Record<string, string>> {
    const token = this.tokenProvider ? await this.tokenProvider() : 'mock-token';
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  public async sendMail(message: M365EmailMessage): Promise<void> {
    const headers = await this.getHeaders();
    const userEndpoint = this.config.userPrincipalName
      ? `/users/${encodeURIComponent(this.config.userPrincipalName)}`
      : '/me';

    const payload = {
      message: {
        subject: message.subject,
        body: {
          contentType: 'HTML',
          content: message.bodyHtml
        },
        toRecipients: message.toRecipients.map((email) => ({
          emailAddress: { address: email }
        }))
      },
      saveToSentItems: true
    };

    const res = await fetch(`${this.baseUrl}${userEndpoint}/sendMail`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok && res.status !== 202) {
      throw new Error(`Graph API sendMail error [${res.status}]: ${res.statusText}`);
    }
  }

  public async createEvent(event: M365CalendarEvent): Promise<{ id: string }> {
    const headers = await this.getHeaders();
    const userEndpoint = this.config.userPrincipalName
      ? `/users/${encodeURIComponent(this.config.userPrincipalName)}`
      : '/me';

    const payload = {
      subject: event.subject,
      body: {
        contentType: 'HTML',
        content: event.body
      },
      start: {
        dateTime: event.startDateTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: 'UTC'
      }
    };

    const res = await fetch(`${this.baseUrl}${userEndpoint}/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Graph API createEvent error [${res.status}]: ${res.statusText}`);
    }

    return (await res.json()) as { id: string };
  }
}
