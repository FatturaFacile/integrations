import { Logger } from '@fatturafacile/shared';

export interface AuditRecord {
  id: string;
  tenantId: string;
  action: string;
  resource: string;
  resourceId?: string;
  actorId?: string;
  status: 'success' | 'failure';
  details?: Record<string, unknown>;
  timestamp: string;
}

export class AuditLogger {
  private readonly records: AuditRecord[] = [];

  constructor(private readonly logger?: Logger) {}

  public record(entry: Omit<AuditRecord, 'id' | 'timestamp'>): AuditRecord {
    const record: AuditRecord = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };

    this.records.push(record);
    this.logger?.info(`AUDIT: [${record.action}] on ${record.resource}`, {
      tenantId: record.tenantId,
      actorId: record.actorId,
      status: record.status
    });

    return record;
  }

  public getTenantRecords(tenantId: string): ReadonlyArray<AuditRecord> {
    return this.records.filter((r) => r.tenantId === tenantId);
  }
}
