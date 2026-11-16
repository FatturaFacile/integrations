import { FatturaFacileClient } from '@fatturafacile/openapi-sdk';
import { Logger } from '@fatturafacile/shared';
import { WordPressConfig, CustomerInvoiceSummary } from '../domain/types.js';

export class WordPressPortalService {
  constructor(
    private readonly erpClient: FatturaFacileClient,
    private readonly config: WordPressConfig,
    private readonly logger: Logger
  ) {}

  public async getInvoicesForUser(userEmail: string): Promise<CustomerInvoiceSummary[]> {
    this.logger.info(`Fetching customer invoices for WordPress user: ${userEmail}`);

    const customer = await this.erpClient.customers.findByVatOrEmail(userEmail);
    if (!customer) {
      this.logger.warn(`No FatturaFacile customer found for WP user: ${userEmail}`);
      return [];
    }

    const invoicesResponse = await this.erpClient.invoices.list({
      page: 1,
      perPage: 50
    });

    const userInvoices = invoicesResponse.data.filter((inv) => inv.customerId === customer.id);

    return userInvoices.map((inv) => ({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      status: inv.status,
      amountGross: inv.totalGross,
      currency: inv.currency,
      downloadUrl: `${this.config.siteUrl.replace(/\/$/, '')}/wp-json/fatturafacile/v1/download/${inv.id}`
    }));
  }
}
