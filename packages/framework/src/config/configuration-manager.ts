export class ConfigurationManager {
  private readonly configStore = new Map<string, Record<string, unknown>>();

  public setTenantConfig(tenantId: string, connectorId: string, config: Record<string, unknown>): void {
    const key = `${tenantId}:${connectorId}`;
    this.configStore.set(key, { ...config });
  }

  public getTenantConfig<T = Record<string, unknown>>(tenantId: string, connectorId: string): T | undefined {
    const key = `${tenantId}:${connectorId}`;
    return this.configStore.get(key) as T | undefined;
  }

  public deleteTenantConfig(tenantId: string, connectorId: string): boolean {
    const key = `${tenantId}:${connectorId}`;
    return this.configStore.delete(key);
  }

  public clear(): void {
    this.configStore.clear();
  }
}
