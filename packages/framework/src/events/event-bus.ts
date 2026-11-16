import { DomainEvent } from '@fatturafacile/shared';

export type EventHandler<T = Record<string, unknown>> = (event: DomainEvent<T>) => Promise<void>;

export class EventBus {
  private readonly subscribers = new Map<string, EventHandler<never>[]>();

  public subscribe<T = Record<string, unknown>>(eventName: string, handler: EventHandler<T>): () => void {
    const list = this.subscribers.get(eventName) ?? [];
    list.push(handler as EventHandler<never>);
    this.subscribers.set(eventName, list);

    return () => {
      const current = this.subscribers.get(eventName) ?? [];
      this.subscribers.set(eventName, current.filter((h) => (h as unknown) !== handler));
    };
  }

  public async publish<T = Record<string, unknown>>(event: DomainEvent<T>): Promise<void> {
    const handlers = this.subscribers.get(event.name) ?? [];
    const wildcardHandlers = this.subscribers.get('*') ?? [];
    const allHandlers = [...handlers, ...wildcardHandlers];

    await Promise.all(allHandlers.map((h) => (h as EventHandler<T>)(event)));
  }

  public clear(): void {
    this.subscribers.clear();
  }
}
