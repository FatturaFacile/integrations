import {
  FatturaFacileClient,
  CreateInvoiceRequest
} from '@fatturafacile/openapi-sdk';
import { Logger } from '@fatturafacile/shared';
import { CursorMcpToolCall, CursorMcpToolResult } from '../domain/types.js';

export class CursorMcpService {
  constructor(
    private readonly erpClient: FatturaFacileClient,
    private readonly tenantId: string,
    private readonly logger: Logger
  ) {}

  public async executeTool(call: CursorMcpToolCall): Promise<CursorMcpToolResult> {
    this.logger.info(`Executing Cursor MCP tool: ${call.name}`);

    switch (call.name) {
      case 'cursor_query_erp_schema': {
        const entity = String(call.arguments['entity'] || 'invoice');
        return {
          tool: call.name,
          output: {
            entity,
            fields: [
              'id',
              'invoiceNumber',
              'type',
              'status',
              'issueDate',
              'dueDate',
              'customerId',
              'items',
              'totalNet',
              'totalVat',
              'totalGross'
            ]
          }
        };
      }

      case 'cursor_test_invoice_creation': {
        const description = String(call.arguments['description'] || 'Test Invoice');
        const amount = Number(call.arguments['amount'] || 100);
        const customerId = String(call.arguments['customerId'] || 'test-customer');

        const req: CreateInvoiceRequest = {
          type: 'standard',
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
          customerId,
          items: [
            {
              description,
              quantity: 1,
              unitPriceNet: amount,
              vatRatePercentage: 22
            }
          ],
          notes: 'Test creation from Cursor IDE agent'
        };

        const invoice = await this.erpClient.invoices.create(req);
        return {
          tool: call.name,
          output: {
            success: true,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            totalGross: invoice.totalGross
          }
        };
      }

      case 'cursor_inspect_tenant_context': {
        return {
          tool: call.name,
          output: {
            tenantId: this.tenantId,
            mcpVersion: '1.0.0',
            features: ['invoices', 'customers', 'products', 'payments']
          }
        };
      }

      default:
        return {
          tool: call.name,
          output: null,
          error: `Unknown Cursor MCP tool: ${call.name}`
        };
    }
  }
}
