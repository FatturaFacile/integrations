import {
  FatturaFacileClient,
  InvoiceStatus,
  CreateInvoiceRequest
} from '@fatturafacile/openapi-sdk';
import { Logger } from '@fatturafacile/shared';
import {
  McpToolDefinition,
  McpResourceDefinition,
  McpRequest,
  McpResponse
} from '../domain/types.js';

export class ClaudeMcpServer {
  private readonly tools: McpToolDefinition[] = [
    {
      name: 'fatturafacile_lookup_customer',
      description: 'Search for a customer in FatturaFacile ERP by VAT number, tax code, or email address',
      inputSchema: {
        type: 'object',
        properties: {
          identifier: { type: 'string', description: 'Customer VAT number, fiscal code, or email' }
        },
        required: ['identifier']
      }
    },
    {
      name: 'fatturafacile_create_invoice',
      description: 'Create and draft a new electronic invoice for a customer in FatturaFacile ERP',
      inputSchema: {
        type: 'object',
        properties: {
          customerId: { type: 'string', description: 'ERP Customer ID' },
          description: { type: 'string', description: 'Line item description' },
          amountNet: { type: 'number', description: 'Net price amount in EUR' },
          vatRatePercentage: { type: 'number', description: 'VAT rate percentage (default: 22)' }
        },
        required: ['customerId', 'description', 'amountNet']
      }
    },
    {
      name: 'fatturafacile_list_invoices',
      description: 'List recent invoices with optional status filter',
      inputSchema: {
        type: 'object',
        properties: {
          page: { type: 'number', description: 'Page number' },
          status: { type: 'string', description: 'Filter by invoice status (e.g. issued, paid, draft)' }
        }
      }
    },
    {
      name: 'fatturafacile_get_financial_summary',
      description: 'Get total revenue and invoices status breakdown from FatturaFacile ERP',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ];

  private readonly resources: McpResourceDefinition[] = [
    {
      uri: 'fatturafacile://schema/invoice',
      name: 'FatturaFacile Invoice Schema',
      mimeType: 'application/json',
      description: 'Canonical OpenAPI schema definition for FatturaFacile Invoices'
    },
    {
      uri: 'fatturafacile://schema/customer',
      name: 'FatturaFacile Customer Schema',
      mimeType: 'application/json',
      description: 'Canonical OpenAPI schema definition for FatturaFacile Customers'
    }
  ];

  constructor(
    private readonly erpClient: FatturaFacileClient,
    private readonly logger: Logger
  ) {}

  public async handleRequest(req: McpRequest): Promise<McpResponse> {
    this.logger.info(`Claude MCP handleRequest: ${req.method} (ID: ${req.id})`);

    try {
      switch (req.method) {
        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id: req.id,
            result: { tools: this.tools }
          };

        case 'resources/list':
          return {
            jsonrpc: '2.0',
            id: req.id,
            result: { resources: this.resources }
          };

        case 'resources/read': {
          const uri = String(req.params?.['uri'] || '');
          if (uri === 'fatturafacile://schema/invoice') {
            return {
              jsonrpc: '2.0',
              id: req.id,
              result: {
                contents: [
                  {
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify({ type: 'object', properties: { invoiceNumber: { type: 'string' }, totalGross: { type: 'number' } } })
                  }
                ]
              }
            };
          }
          return {
            jsonrpc: '2.0',
            id: req.id,
            error: { code: -32602, message: `Resource not found: ${uri}` }
          };
        }

        case 'tools/call': {
          const name = String(req.params?.['name'] || '');
          const args = (req.params?.['arguments'] as Record<string, unknown>) || {};
          return await this.callTool(req.id, name, args);
        }

        default:
          return {
            jsonrpc: '2.0',
            id: req.id,
            error: { code: -32601, message: `Method not found: ${req.method}` }
          };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        jsonrpc: '2.0',
        id: req.id,
        error: { code: -32603, message: `Internal MCP error: ${msg}` }
      };
    }
  }

  private async callTool(reqId: string | number, name: string, args: Record<string, unknown>): Promise<McpResponse> {
    switch (name) {
      case 'fatturafacile_lookup_customer': {
        const identifier = String(args['identifier'] || '');
        const customer = await this.erpClient.customers.findByVatOrEmail(identifier);
        return {
          jsonrpc: '2.0',
          id: reqId,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(customer ? { found: true, customer } : { found: false })
              }
            ]
          }
        };
      }

      case 'fatturafacile_create_invoice': {
        const customerId = String(args['customerId']);
        const description = String(args['description']);
        const amountNet = Number(args['amountNet']);
        const vatRate = Number(args['vatRatePercentage'] || 22);

        const createReq: CreateInvoiceRequest = {
          type: 'standard',
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
          customerId,
          items: [
            {
              description,
              quantity: 1,
              unitPriceNet: amountNet,
              vatRatePercentage: vatRate
            }
          ],
          notes: 'Created via Anthropic Claude MCP'
        };

        const invoice = await this.erpClient.invoices.create(createReq);
        return {
          jsonrpc: '2.0',
          id: reqId,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  status: 'created',
                  invoiceId: invoice.id,
                  invoiceNumber: invoice.invoiceNumber,
                  totalGross: invoice.totalGross
                })
              }
            ]
          }
        };
      }

      case 'fatturafacile_list_invoices': {
        const page = Number(args['page'] || 1);
        const status = args['status'] as InvoiceStatus;
        const list = await this.erpClient.invoices.list({ page, perPage: 20, status });
        return {
          jsonrpc: '2.0',
          id: reqId,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(list)
              }
            ]
          }
        };
      }

      case 'fatturafacile_get_financial_summary': {
        const invoices = await this.erpClient.invoices.list({ page: 1, perPage: 100 });
        const totalGross = invoices.data.reduce((acc, i) => acc + i.totalGross, 0);
        const paidCount = invoices.data.filter((i) => i.status === 'paid').length;
        return {
          jsonrpc: '2.0',
          id: reqId,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  totalInvoices: invoices.data.length,
                  totalRevenueGross: totalGross,
                  paidInvoicesCount: paidCount,
                  openInvoicesCount: invoices.data.length - paidCount
                })
              }
            ]
          }
        };
      }

      default:
        return {
          jsonrpc: '2.0',
          id: reqId,
          error: { code: -32602, message: `Unknown tool: ${name}` }
        };
    }
  }
}
