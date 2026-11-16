import { FatturaFacileClient } from '@fatturafacile/openapi-sdk';
import { Logger } from '@fatturafacile/shared';
import { TeamsAdaptiveCard, TeamsConfig } from '../domain/types.js';
import { TeamsWebhookClient } from '../infrastructure/teams-webhook-client.js';

export class TeamsNotificationService {
  constructor(
    private readonly erpClient: FatturaFacileClient,
    private readonly webhookClient: TeamsWebhookClient,
    _config: TeamsConfig,
    private readonly logger: Logger
  ) {}

  public async notifyInvoiceIssued(invoiceId: string): Promise<boolean> {
    this.logger.info(`Sending Teams Adaptive Card notification for invoice: ${invoiceId}`);
    const invoice = await this.erpClient.invoices.get(invoiceId);

    const card: TeamsAdaptiveCard = {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.4',
            body: [
              {
                type: 'TextBlock',
                size: 'Medium',
                weight: 'Bolder',
                text: '📢 Nuova Fattura Emessa - FatturaFacile'
              },
              {
                type: 'FactSet',
                facts: [
                  { title: 'Fattura N.:', value: invoice.invoiceNumber },
                  { title: 'Importo:', value: `${invoice.totalGross.toFixed(2)} ${invoice.currency}` },
                  { title: 'Data Scadenza:', value: invoice.dueDate },
                  { title: 'Stato:', value: invoice.status.toUpperCase() }
                ]
              }
            ],
            actions: [
              {
                type: 'Action.OpenUrl',
                title: 'Visualizza nel Portale',
                url: `https://app.fatturafacile.it/invoices/${invoice.id}`
              }
            ]
          }
        }
      ]
    };

    await this.webhookClient.sendCard(card);
    return true;
  }
}
