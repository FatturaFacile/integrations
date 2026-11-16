import { HealthStatus } from '../connector/types.js';

export interface HealthCheckProbe {
  name: string;
  check: () => Promise<HealthStatus>;
}

export interface CompositeHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  probes: Record<string, HealthStatus>;
}

export class HealthCheckRegistry {
  private readonly probes = new Map<string, HealthCheckProbe>();

  public register(probe: HealthCheckProbe): void {
    this.probes.set(probe.name, probe);
  }

  public async evaluateAll(): Promise<CompositeHealthResult> {
    const results: Record<string, HealthStatus> = {};
    let hasFailure = false;

    for (const [name, probe] of this.probes.entries()) {
      try {
        const res = await probe.check();
        results[name] = res;
        if (!res.healthy) hasFailure = true;
      } catch (err) {
        hasFailure = true;
        results[name] = {
          healthy: false,
          details: { error: err instanceof Error ? err.message : String(err) }
        };
      }
    }

    return {
      status: hasFailure ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      probes: results
    };
  }
}
