import {
  FatturaFacileClient,
  CreateInvoiceRequest
} from '@fatturafacile/openapi-sdk';
import { Logger } from '@fatturafacile/shared';
import { CopilotToolCall, CopilotToolResult } from '../domain/types.js';

export class CopilotToolDispatcher {
  constructor(
    private readonly erpClient: FatturaFacileClient,
    private readonly logger: Logger
  ) {}

  public async executeTool(call: CopilotToolCall): Promise<CopilotToolResult> {
    this.logger.info(`Executing Copilot tool: ${call.name}`);

    try {
      switch (call.name) {
        case 'customer_lookup': {
          const identifier = String(call.parameters['identifier'] || '');
          const customer = await this.erpClient.customers.findByVatOrEmail(identifier);
          return {
            toolName: call.name,
            result: { found: Boolean(customer), customer }
          };
        }

        case 'invoice_create': {
          const customerId = String(call.parameters['customerId']);
          const description = String(call.parameters['description'] || 'Consulenza');
          const amount = Number(call.parameters['amount'] || 0);
          const vat = Number(call.parameters['vatRate'] || 22);

          const req: CreateInvoiceRequest = {
            type: 'standard',
            dueDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
            customerId,
            items: [
              {
                description,
                quantity: 1,
                unitPriceNet: amount,
                vatRatePercentage: vat
              }
            ],
            notes: 'Created via Microsoft 365 Copilot Agent'
          };

          const invoice = await this.erpClient.invoices.create(req);
          return {
            toolName: call.name,
            result: {
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              totalGross: invoice.totalGross
            }
          };
        }

        case 'quote_create': {
          const customerId = String(call.parameters['customerId']);
          const description = String(call.parameters['description'] || 'Preventivo');
          const amount = Number(call.parameters['amount'] || 0);

          const req: CreateInvoiceRequest = {
            type: 'proforma',
            dueDate: new Date(Date.now() + 15 * 86400000).toISOString().substring(0, 10),
            customerId,
            items: [
              {
                description,
                quantity: 1,
                unitPriceNet: amount,
                vatRatePercentage: 22
              }
            ],
            notes: 'Preventivo generato da Copilot'
          };

          const quote = await this.erpClient.invoices.create(req);
          return {
            toolName: call.name,
            result: {
              quoteId: quote.id,
              quoteNumber: quote.invoiceNumber,
              totalGross: quote.totalGross
            }
          };
        }

        case 'reporting': {
          const invoices = await this.erpClient.invoices.list({ page: 1, perPage: 100 });
          const totalRevenue = invoices.data.reduce((acc, inv) => acc + inv.totalGross, 0);
          const paidCount = invoices.data.filter((inv) => inv.status === 'paid').length;
          const openCount = invoices.data.length - paidCount;

          return {
            toolName: call.name,
            result: {
              totalInvoices: invoices.data.length,
              totalRevenue,
              paidCount,
              openCount
            }
          };
        }

        default:
          return {
            toolName: call.name,
            result: {},
            error: `Unknown Copilot tool: ${call.name}`
          };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error executing Copilot tool ${call.name}: ${msg}`);
      return {
        toolName: call.name,
        result: {},
        error: msg
      };
    }
  }
}
