import { IntegrationManifest, validateManifest } from './manifest-validator.js';
import { BaseConnector } from '../connector/base-connector.js';

export interface RegisteredPlugin {
  manifest: IntegrationManifest;
  connectorFactory: () => BaseConnector;
  installedTenants: Set<string>;
}

export class PluginRegistry {
  private readonly plugins = new Map<string, RegisteredPlugin>();

  public register(manifest: IntegrationManifest, connectorFactory: () => BaseConnector): void {
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      throw new Error(`Cannot register plugin [${manifest.name}]: ${validation.errors.join(', ')}`);
    }

    this.plugins.set(manifest.name, {
      manifest,
      connectorFactory,
      installedTenants: new Set()
    });
  }

  public get(name: string): RegisteredPlugin | undefined {
    return this.plugins.get(name);
  }

  public list(): RegisteredPlugin[] {
    return Array.from(this.plugins.values());
  }

  public installForTenant(pluginName: string, tenantId: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin [${pluginName}] not found in registry`);
    }
    plugin.installedTenants.add(tenantId);
  }

  public uninstallForTenant(pluginName: string, tenantId: string): void {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.installedTenants.delete(tenantId);
    }
  }

  public isInstalledForTenant(pluginName: string, tenantId: string): boolean {
    const plugin = this.plugins.get(pluginName);
    return plugin ? plugin.installedTenants.has(tenantId) : false;
  }

  public checkPermission(pluginName: string, permission: string): boolean {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) return false;
    return plugin.manifest.permissions.includes(permission);
  }
}
