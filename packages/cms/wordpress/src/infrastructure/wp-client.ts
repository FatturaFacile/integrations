import { WordPressConfig, WordPressUser } from '../domain/types.js';

export class WordPressClient {
  private readonly baseUrl: string;
  private readonly authHeader?: string;

  constructor(config: WordPressConfig) {
    this.baseUrl = config.siteUrl.replace(/\/$/, '');
    if (config.applicationUsername && config.applicationPassword) {
      const token = Buffer.from(`${config.applicationUsername}:${config.applicationPassword}`).toString('base64');
      this.authHeader = `Basic ${token}`;
    }
  }

  public async getUser(userId: number | string): Promise<WordPressUser> {
    const url = `${this.baseUrl}/wp-json/wp/v2/users/${userId}`;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`WordPress API error [${res.status}]: ${res.statusText}`);
    }

    return (await res.json()) as WordPressUser;
  }
}
