export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

export class RetryPolicy {
  private readonly maxRetries: number;
  private readonly initialDelayMs: number;
  private readonly maxDelayMs: number;
  private readonly backoffFactor: number;
  private readonly shouldRetry: (error: unknown, attempt: number) => boolean;

  constructor(options: RetryOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.initialDelayMs = options.initialDelayMs ?? 100;
    this.maxDelayMs = options.maxDelayMs ?? 5000;
    this.backoffFactor = options.backoffFactor ?? 2;
    this.shouldRetry = options.shouldRetry ?? (() => true);
  }

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;
    let delay = this.initialDelayMs;

    while (true) {
      try {
        return await fn();
      } catch (err) {
        attempt += 1;
        if (attempt > this.maxRetries || !this.shouldRetry(err, attempt)) {
          throw err;
        }

        // Add jitter (±20%)
        const jitter = delay * (0.8 + Math.random() * 0.4);
        await new Promise((resolve) => setTimeout(resolve, Math.min(jitter, this.maxDelayMs)));
        delay *= this.backoffFactor;
      }
    }
  }
}
