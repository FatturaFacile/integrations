export interface CopilotToolCall {
  name: string;
  parameters: Record<string, unknown>;
}

export interface CopilotToolResult {
  toolName: string;
  result: Record<string, unknown>;
  error?: string;
}

export interface CopilotConfig {
  agentName?: string;
  instructions?: string;
  enableInvoiceCreation?: boolean;
}
