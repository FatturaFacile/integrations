export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = 'closed';
  private failureCount = 0;
  private nextAttempt = Date.now();
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 30000;
  }

  public getState(): CircuitBreakerState {
    if (this.state === 'open' && Date.now() >= this.nextAttempt) {
      this.state = 'half-open';
    }
    return this.state;
  }

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.getState() === 'open') {
      throw new Error(`CircuitBreaker is OPEN. Next attempt allowed at ${new Date(this.nextAttempt).toISOString()}`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold || this.state === 'half-open') {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.resetTimeoutMs;
    }
  }
}
