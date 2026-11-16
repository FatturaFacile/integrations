import * as crypto from 'node:crypto';
import { TraceContext } from '../types/index.js';

export function generateTraceId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateSpanId(): string {
  return crypto.randomBytes(8).toString('hex');
}

export function createTraceContext(sampled = true): TraceContext {
  return {
    traceId: generateTraceId(),
    spanId: generateSpanId(),
    sampled
  };
}

export function formatTraceparent(ctx: TraceContext): string {
  const version = '00';
  const flags = ctx.sampled ? '01' : '00';
  return `${version}-${ctx.traceId}-${ctx.spanId}-${flags}`;
}

export function parseTraceparent(header: string): TraceContext | null {
  const parts = header.trim().split('-');
  if (parts.length !== 4) return null;
  const [version, traceId, spanId, flags] = parts;
  if (version !== '00' || !traceId || !spanId || !flags) return null;
  if (traceId.length !== 32 || spanId.length !== 16) return null;

  return {
    traceId,
    spanId,
    sampled: flags === '01'
  };
}
