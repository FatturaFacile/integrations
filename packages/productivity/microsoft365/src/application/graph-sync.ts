import { FatturaFacileClient } from '@fatturafacile/openapi-sdk';
import { Logger } from '@fatturafacile/shared';
import { Microsoft365Config } from '../domain/types.js';
import { MicrosoftGraphClient } from '../infrastructure/graph-client.js';

export class Microsoft365SyncService {
  constructor(
    private readonly erpClient: FatturaFacileClient,
    private readonly graphClient: MicrosoftGraphClient,
    _config: Microsoft365Config,
    private readonly logger: Logger
  ) {}

  public async sendInvoiceNotification(invoiceId: string, recipientEmail: string): Promise<boolean> {
    this.logger.info(`Sending invoice notification email via M365 for invoice: ${invoiceId}`);
    const invoice = await this.erpClient.invoices.get(invoiceId);

    const bodyHtml = `
      <h2>FatturaFacile - Nuova Fattura Emessa</h2>
      <p>Gentile Cliente,</p>
      <p>Le comunichiamo che è stata emessa la fattura <strong>${invoice.invoiceNumber}</strong> di importo pari a <strong>${invoice.totalGross.toFixed(2)} ${invoice.currency}</strong>.</p>
      <p>Data Scadenza: <strong>${invoice.dueDate}</strong></p>
      <hr />
      <p><small>FatturaFacile Enterprise Integrations</small></p>
    `;

    await this.graphClient.sendMail({
      subject: `FatturaFacile: Fattura ${invoice.invoiceNumber}`,
      toRecipients: [recipientEmail],
      bodyHtml
    });

    this.logger.info(`Successfully dispatched M365 email to ${recipientEmail}`);
    return true;
  }

  public async schedulePaymentReminder(invoiceId: string): Promise<string> {
    const invoice = await this.erpClient.invoices.get(invoiceId);
    this.logger.info(`Creating M365 calendar reminder for invoice: ${invoice.invoiceNumber}`);

    const event = await this.graphClient.createEvent({
      subject: `Scadenza Pagamento: Fattura ${invoice.invoiceNumber}`,
      startDateTime: `${invoice.dueDate}T09:00:00Z`,
      endDateTime: `${invoice.dueDate}T10:00:00Z`,
      body: `Ricordarsi di verificare l'incasso o il pagamento della fattura ${invoice.invoiceNumber} (${invoice.totalGross} ${invoice.currency}).`
    });

    return event.id;
  }
}
