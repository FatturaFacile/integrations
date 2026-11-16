export interface CursorMcpToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface CursorMcpToolResult {
  tool: string;
  output: unknown;
  error?: string;
}

export interface CursorConfig {
  debugMode?: boolean;
}
