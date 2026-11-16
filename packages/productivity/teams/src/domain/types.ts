export interface TeamsAdaptiveCard {
  type: 'message';
  attachments: Array<{
    contentType: 'application/vnd.microsoft.card.adaptive';
    content: {
      $schema: string;
      type: 'AdaptiveCard';
      version: string;
      body: Array<Record<string, unknown>>;
      actions?: Array<Record<string, unknown>>;
    };
  }>;
}

export interface TeamsConfig {
  webhookUrl: string;
  enableAlerts?: boolean;
}
