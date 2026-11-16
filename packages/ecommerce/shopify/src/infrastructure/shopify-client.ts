import { ShopifyConfig, ShopifyOrder } from '../domain/types.js';

export class ShopifyClient {
  private readonly baseUrl: string;

  constructor(private readonly config: ShopifyConfig) {
    this.baseUrl = `https://${config.shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')}/admin/api/2024-01`;
  }

  public async getOrder(orderId: number | string): Promise<ShopifyOrder> {
    const url = `${this.baseUrl}/orders/${orderId}.json`;
    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': this.config.accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Shopify API error [${res.status}]: ${res.statusText}`);
    }

    const data = (await res.json()) as { order: ShopifyOrder };
    return data.order;
  }
}
