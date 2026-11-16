import { BaseConnector, ConnectorContext, ConnectorResult, HealthStatus } from '@fatturafacile/framework';

export interface PostmanCollectionItem {
  name: string;
  request: {
    method: string;
    header: Array<{ key: string; value: string }>;
    url: {
      raw: string;
      host: string[];
      path: string[];
    };
    body?: {
      mode: string;
      raw: string;
    };
  };
}

export interface PostmanCollectionV21 {
  info: {
    name: string;
    schema: string;
    version: string;
  };
  item: PostmanCollectionItem[];
}

export class PostmanConnector extends BaseConnector {
  public readonly id = 'postman';
  public readonly name = 'Postman & API Client Collection Generator';
  public readonly version = '1.0.0';

  public async onInitialize(_context: ConnectorContext): Promise<ConnectorResult<void>> {
    this.logger.info('Initialized Postman & API Collection Generator');
    return { success: true };
  }

  public generatePostmanCollection(baseUrl = 'https://api.fatturafacile.it'): PostmanCollectionV21 {
    return {
      info: {
        name: 'FatturaFacile ERP REST API',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        version: '2.4.0'
      },
      item: [
        {
          name: 'Create Invoice',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'X-Tenant-ID', value: '{{tenantId}}' },
              { key: 'X-API-Key', value: '{{apiKey}}' }
            ],
            url: {
              raw: `${baseUrl}/api/v1/erp/invoices`,
              host: [baseUrl],
              path: ['api', 'v1', 'erp', 'invoices']
            },
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  type: 'standard',
                  dueDate: '2026-12-31',
                  customerId: 'cust_sample_123',
                  items: [
                    {
                      description: 'Sample item',
                      quantity: 1,
                      unitPriceNet: 100,
                      vatRatePercentage: 22
                    }
                  ]
                },
                null,
                2
              )
            }
          }
        },
        {
          name: 'Get Customer',
          request: {
            method: 'GET',
            header: [
              { key: 'X-Tenant-ID', value: '{{tenantId}}' },
              { key: 'X-API-Key', value: '{{apiKey}}' }
            ],
            url: {
              raw: `${baseUrl}/api/v1/erp/customers/{{customerId}}`,
              host: [baseUrl],
              path: ['api', 'v1', 'erp', 'customers', '{{customerId}}']
            }
          }
        }
      ]
    };
  }

  public async onHealthCheck(): Promise<HealthStatus> {
    return { healthy: true, details: { status: 'ready' } };
  }
}

export default PostmanConnector;
