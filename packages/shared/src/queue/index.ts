import { Logger } from '../logger/index.js';

export interface QueueJob<T = unknown> {
  id: string;
  name: string;
  tenantId: string;
  payload: T;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  runAt?: number | undefined;
}

export type JobHandler<T = unknown> = (job: QueueJob<T>) => Promise<void>;

export class InMemoryQueue<T = unknown> {
  private readonly jobs: QueueJob<T>[] = [];
  private readonly dlq: QueueJob<T>[] = [];
  private readonly handlers: Map<string, JobHandler<T>> = new Map();
  private isProcessing = false;
  private readonly logger: Logger;

  constructor(logger?: Logger | undefined) {
    this.logger = logger ?? new Logger({ component: 'InMemoryQueue' });
  }

  public registerHandler(jobName: string, handler: JobHandler<T>): void {
    this.handlers.set(jobName, handler);
  }

  public async enqueue(
    jobName: string,
    tenantId: string,
    payload: T,
    options?: { maxAttempts?: number | undefined; delayMs?: number | undefined } | undefined
  ): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = Date.now();
    const job: QueueJob<T> = {
      id: jobId,
      name: jobName,
      tenantId,
      payload,
      attempts: 0,
      maxAttempts: options?.maxAttempts ?? 3,
      createdAt: now,
      runAt: options?.delayMs ? now + options.delayMs : now
    };

    this.jobs.push(job);
    this.logger.debug(`Enqueued job ${job.id} [${jobName}] for tenant ${tenantId}`);
    return jobId;
  }

  public async processNext(): Promise<boolean> {
    if (this.isProcessing) return false;
    this.isProcessing = true;

    try {
      const now = Date.now();
      const readyIndex = this.jobs.findIndex((j) => (j.runAt ?? 0) <= now);
      if (readyIndex === -1) {
        return false;
      }

      const [job] = this.jobs.splice(readyIndex, 1);
      if (!job) return false;

      const handler = this.handlers.get(job.name);
      if (!handler) {
        this.logger.warn(`No handler registered for job type [${job.name}], moving to DLQ`);
        this.dlq.push(job);
        return true;
      }

      job.attempts += 1;
      try {
        await handler(job);
        this.logger.debug(`Job ${job.id} [${job.name}] succeeded on attempt ${job.attempts}`);
      } catch (err) {
        this.logger.error(`Job ${job.id} [${job.name}] failed attempt ${job.attempts}`, undefined, err);
        if (job.attempts < job.maxAttempts) {
          // Exponential backoff
          const backoff = Math.pow(2, job.attempts) * 1000;
          job.runAt = Date.now() + backoff;
          this.jobs.push(job);
        } else {
          this.logger.error(`Job ${job.id} [${job.name}] exhausted ${job.maxAttempts} attempts, moving to DLQ`);
          this.dlq.push(job);
        }
      }
      return true;
    } finally {
      this.isProcessing = false;
      if (this.jobs.some((j) => (j.runAt ?? 0) <= Date.now())) {
        queueMicrotask(() => this.processNext());
      }
    }
  }

  public getQueueLength(): number {
    return this.jobs.length;
  }

  public getDlqLength(): number {
    return this.dlq.length;
  }

  public getDlqJobs(): ReadonlyArray<QueueJob<T>> {
    return [...this.dlq];
  }
}
