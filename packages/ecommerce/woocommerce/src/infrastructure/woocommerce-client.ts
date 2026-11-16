import { WooCommerceConfig, WooCommerceOrder } from '../domain/types.js';

export class WooCommerceClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;

  constructor(config: WooCommerceConfig) {
    this.baseUrl = config.storeUrl.replace(/\/$/, '');
    const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  public async getOrder(orderId: number | string): Promise<WooCommerceOrder> {
    const url = `${this.baseUrl}/wp-json/wc/v3/orders/${orderId}`;
    const response = await fetch(url, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API Error [${response.status}]: ${response.statusText}`);
    }

    return (await response.json()) as WooCommerceOrder;
  }
}
