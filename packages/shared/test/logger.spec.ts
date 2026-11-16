import { describe, it, expect } from 'vitest';
import { Logger, LogEntry } from '../src/logger/index.js';

describe('Shared Structured Logger', () => {
  it('should capture structured logs and obey log level thresholds', () => {
    const logs: LogEntry[] = [];
    const logger = new Logger({
      component: 'TestComponent',
      minLevel: 'info',
      tenantContext: { tenantId: 'tenant-999' },
      sink: (entry) => logs.push(entry)
    });

    logger.debug('This should be skipped');
    logger.info('User logged in', { userId: 'usr_1' });
    logger.warn('Rate limit approaching', { count: 95 });
    logger.error('Failed to sync', { attempt: 3 }, new Error('Network timeout'));

    expect(logs).toHaveLength(3);
    expect(logs[0]?.level).toBe('info');
    expect(logs[0]?.message).toBe('User logged in');
    expect(logs[0]?.tenantId).toBe('tenant-999');
    expect(logs[0]?.component).toBe('TestComponent');

    expect(logs[2]?.level).toBe('error');
    expect(logs[2]?.error?.message).toBe('Network timeout');
  });

  it('should create child loggers with inherited and overridden properties', () => {
    const logs: LogEntry[] = [];
    const parent = new Logger({
      component: 'Parent',
      minLevel: 'info',
      tenantContext: { tenantId: 'tenant-1' },
      sink: (entry) => logs.push(entry)
    });

    const child = parent.child({
      component: 'ChildWorker'
    });

    child.info('Child operation started');

    expect(logs).toHaveLength(1);
    expect(logs[0]?.component).toBe('ChildWorker');
    expect(logs[0]?.tenantId).toBe('tenant-1');
  });
});
