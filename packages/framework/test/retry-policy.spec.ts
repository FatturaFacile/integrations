import { describe, it, expect } from 'vitest';
import { RetryPolicy } from '../src/resilience/retry-policy.js';

describe('Framework RetryPolicy', () => {
  it('should retry failing operation up to maxRetries and return value', async () => {
    const policy = new RetryPolicy({ maxRetries: 3, initialDelayMs: 10, backoffFactor: 1 });
    let attempts = 0;

    const result = await policy.execute(async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error('Transient error');
      }
      return 'success';
    });

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should throw if attempts exceed maxRetries', async () => {
    const policy = new RetryPolicy({ maxRetries: 2, initialDelayMs: 5, backoffFactor: 1 });
    let attempts = 0;

    await expect(
      policy.execute(async () => {
        attempts += 1;
        throw new Error('Persistent failure');
      })
    ).rejects.toThrow('Persistent failure');

    expect(attempts).toBe(3); // 1 initial + 2 retries
  });
});
