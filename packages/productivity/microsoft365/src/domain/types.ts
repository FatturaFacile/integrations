export interface M365EmailMessage {
  subject: string;
  toRecipients: string[];
  bodyHtml: string;
}

export interface M365CalendarEvent {
  subject: string;
  startDateTime: string;
  endDateTime: string;
  body: string;
}

export interface Microsoft365Config {
  tenantId: string;
  clientId: string;
  clientSecret?: string;
  userPrincipalName?: string; // sender mailbox
}
