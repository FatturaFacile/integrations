export interface CacheDriver {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

export class InMemoryCacheDriver implements CacheDriver {
  private readonly store = new Map<string, { value: unknown; expiresAt?: number | undefined }>();

  public async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  public async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
    this.store.set(key, { value, expiresAt });
  }

  public async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  public async clear(): Promise<void> {
    this.store.clear();
  }
}

export class CacheManager {
  constructor(private readonly driver: CacheDriver = new InMemoryCacheDriver()) {}

  public formatTenantKey(tenantId: string, key: string): string {
    return `tenant:${tenantId}:${key}`;
  }

  public async get<T>(tenantId: string, key: string): Promise<T | null> {
    return this.driver.get<T>(this.formatTenantKey(tenantId, key));
  }

  public async set<T>(tenantId: string, key: string, value: T, ttlMs?: number): Promise<void> {
    return this.driver.set<T>(this.formatTenantKey(tenantId, key), value, ttlMs);
  }

  public async delete(tenantId: string, key: string): Promise<boolean> {
    return this.driver.delete(this.formatTenantKey(tenantId, key));
  }
}
