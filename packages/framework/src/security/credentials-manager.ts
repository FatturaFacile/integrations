import { SecretManager } from './secret-manager.js';

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp ms
}

export class CredentialsManager {
  constructor(private readonly secretManager: SecretManager) {}

  public async saveOAuthTokens(
    tenantId: string,
    provider: string,
    tokens: OAuthTokens
  ): Promise<void> {
    await this.secretManager.storeSecret(
      tenantId,
      `oauth_${provider}`,
      JSON.stringify(tokens)
    );
  }

  public async getOAuthTokens(
    tenantId: string,
    provider: string
  ): Promise<OAuthTokens | null> {
    const raw = await this.secretManager.retrieveSecret(
      tenantId,
      `oauth_${provider}`
    );
    if (!raw) return null;
    return JSON.parse(raw) as OAuthTokens;
  }

  public isTokenExpiringSoon(tokens: OAuthTokens, thresholdSeconds = 300): boolean {
    const now = Date.now();
    return tokens.expiresAt - now < thresholdSeconds * 1000;
  }
}
