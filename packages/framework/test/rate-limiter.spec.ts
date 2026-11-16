import { describe, it, expect } from 'vitest';
import { TokenBucketRateLimiter } from '../src/resilience/rate-limiter.js';

describe('Framework TokenBucketRateLimiter', () => {
  it('should allow burst requests up to max tokens and reject excess', () => {
    const limiter = new TokenBucketRateLimiter({
      maxRequests: 3,
      windowMs: 1000
    });

    expect(limiter.tryAcquire(1)).toBe(true);
    expect(limiter.tryAcquire(1)).toBe(true);
    expect(limiter.tryAcquire(1)).toBe(true);
    expect(limiter.tryAcquire(1)).toBe(false);
  });
});
