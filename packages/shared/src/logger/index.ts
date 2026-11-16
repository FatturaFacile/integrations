import { TenantContext, TraceContext } from '../types/index.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  component?: string | undefined;
  tenantId?: string | undefined;
  traceId?: string | undefined;
  spanId?: string | undefined;
  context?: Record<string, unknown> | undefined;
  error?: {
    name: string;
    message: string;
    stack?: string | undefined;
  } | undefined;
}

export interface LoggerOptions {
  component?: string | undefined;
  minLevel?: LogLevel | undefined;
  tenantContext?: TenantContext | undefined;
  traceContext?: TraceContext | undefined;
  sink?: ((entry: LogEntry) => void) | undefined;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

export class Logger {
  private readonly component?: string | undefined;
  private readonly minLevel: LogLevel;
  private readonly tenantContext?: TenantContext | undefined;
  private readonly traceContext?: TraceContext | undefined;
  private readonly sink: (entry: LogEntry) => void;

  constructor(options: LoggerOptions = {}) {
    this.component = options.component;
    this.minLevel = options.minLevel ?? 'info';
    this.tenantContext = options.tenantContext;
    this.traceContext = options.traceContext;
    this.sink = options.sink ?? ((entry) => {
      const line = JSON.stringify(entry);
      if (entry.level === 'error') {
        console.error(line);
      } else if (entry.level === 'warn') {
        console.warn(line);
      } else {
        console.info(line);
      }
    });
  }

  public child(subOptions: Partial<LoggerOptions>): Logger {
    return new Logger({
      component: subOptions.component ?? this.component,
      minLevel: subOptions.minLevel ?? this.minLevel,
      tenantContext: subOptions.tenantContext ?? this.tenantContext,
      traceContext: subOptions.traceContext ?? this.traceContext,
      sink: subOptions.sink ?? this.sink
    });
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.minLevel];
  }

  private createEntry(level: LogLevel, message: string, context?: Record<string, unknown>, err?: unknown): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component: this.component,
      tenantId: this.tenantContext?.tenantId,
      traceId: this.traceContext?.traceId,
      spanId: this.traceContext?.spanId,
      context
    };

    if (err instanceof Error) {
      entry.error = {
        name: err.name,
        message: err.message,
        stack: err.stack
      };
    } else if (err) {
      entry.error = {
        name: 'UnknownError',
        message: String(err)
      };
    }

    return entry;
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      this.sink(this.createEntry('debug', message, context));
    }
  }

  public info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      this.sink(this.createEntry('info', message, context));
    }
  }

  public warn(message: string, context?: Record<string, unknown>, err?: unknown): void {
    if (this.shouldLog('warn')) {
      this.sink(this.createEntry('warn', message, context, err));
    }
  }

  public error(message: string, context?: Record<string, unknown>, err?: unknown): void {
    if (this.shouldLog('error')) {
      this.sink(this.createEntry('error', message, context, err));
    }
  }
}
