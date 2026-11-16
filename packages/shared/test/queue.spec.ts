import { describe, it, expect } from 'vitest';
import { InMemoryQueue } from '../src/queue/index.js';
import { Logger } from '../src/logger/index.js';

describe('Shared InMemoryQueue', () => {
  it('should enqueue and process jobs successfully', async () => {
    const queue = new InMemoryQueue<{ orderId: string }>(
      new Logger({ minLevel: 'error', sink: () => {} })
    );

    let processedOrderId = '';
    queue.registerHandler('process-order', async (job) => {
      processedOrderId = job.payload.orderId;
    });

    const jobId = await queue.enqueue('process-order', 'tenant-100', { orderId: 'ord_42' });
    expect(jobId).toBeDefined();

    const didProcess = await queue.processNext();
    expect(didProcess).toBe(true);
    expect(processedOrderId).toBe('ord_42');
    expect(queue.getQueueLength()).toBe(0);
    expect(queue.getDlqLength()).toBe(0);
  });

  it('should route unhandled or failing jobs to DLQ when maxAttempts exceeded', async () => {
    const queue = new InMemoryQueue(
      new Logger({ minLevel: 'error', sink: () => {} })
    );

    queue.registerHandler('failing-job', async () => {
      throw new Error('Permanent failure');
    });

    await queue.enqueue('failing-job', 'tenant-100', {}, { maxAttempts: 1 });

    const didProcess = await queue.processNext();
    expect(didProcess).toBe(true);
    expect(queue.getQueueLength()).toBe(0);
    expect(queue.getDlqLength()).toBe(1);
    expect(queue.getDlqJobs()[0]?.name).toBe('failing-job');
  });
});
