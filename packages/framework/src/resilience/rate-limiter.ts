export interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

export class TokenBucketRateLimiter {
  private readonly maxTokens: number;
  private readonly refillRatePerMs: number;
  private tokens: number;
  private lastRefill: number;

  constructor(options: RateLimiterOptions) {
    this.maxTokens = options.maxRequests;
    this.tokens = options.maxRequests;
    this.refillRatePerMs = options.maxRequests / options.windowMs;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRatePerMs;
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  public tryAcquire(count = 1): boolean {
    this.refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  public async acquire(count = 1): Promise<void> {
    while (!this.tryAcquire(count)) {
      const waitTime = Math.ceil((count - this.tokens) / this.refillRatePerMs);
      await new Promise((resolve) => setTimeout(resolve, Math.max(10, waitTime)));
    }
  }

  public getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}
