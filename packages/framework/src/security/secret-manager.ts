import { encryptAes256Gcm, decryptAes256Gcm, EncryptedPayload } from '@fatturafacile/shared';

export interface SecretStoreDriver {
  get(key: string): Promise<EncryptedPayload | null>;
  set(key: string, payload: EncryptedPayload): Promise<void>;
  delete(key: string): Promise<boolean>;
}

export class InMemorySecretStoreDriver implements SecretStoreDriver {
  private readonly store = new Map<string, EncryptedPayload>();

  public async get(key: string): Promise<EncryptedPayload | null> {
    return this.store.get(key) ?? null;
  }

  public async set(key: string, payload: EncryptedPayload): Promise<void> {
    this.store.set(key, payload);
  }

  public async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }
}

export class SecretManager {
  private readonly masterKeyHex: string;
  private readonly driver: SecretStoreDriver;

  constructor(masterKeyHex: string, driver?: SecretStoreDriver) {
    if (masterKeyHex.length !== 64) {
      throw new Error('SecretManager requires a 32-byte master key (64 hex characters)');
    }
    this.masterKeyHex = masterKeyHex;
    this.driver = driver ?? new InMemorySecretStoreDriver();
  }

  private formatKey(tenantId: string, secretName: string): string {
    return `tenant:${tenantId}:secret:${secretName}`;
  }

  public async storeSecret(tenantId: string, secretName: string, plainText: string): Promise<void> {
    const key = this.formatKey(tenantId, secretName);
    const encrypted = encryptAes256Gcm(plainText, this.masterKeyHex);
    await this.driver.set(key, encrypted);
  }

  public async retrieveSecret(tenantId: string, secretName: string): Promise<string | null> {
    const key = this.formatKey(tenantId, secretName);
    const encrypted = await this.driver.get(key);
    if (!encrypted) return null;
    return decryptAes256Gcm(encrypted, this.masterKeyHex);
  }

  public async deleteSecret(tenantId: string, secretName: string): Promise<boolean> {
    const key = this.formatKey(tenantId, secretName);
    return this.driver.delete(key);
  }
}
