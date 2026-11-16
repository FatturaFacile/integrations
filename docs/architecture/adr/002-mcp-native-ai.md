# ADR 002: Native Model Context Protocol (MCP) for AI Agent Integrations

## Context
Modern developer workflows and enterprise user experiences increasingly rely on autonomous AI agents (Anthropic Claude, Cursor IDE, Microsoft 365 Copilot, OpenAI, Gemini). Rather than building proprietary bot integrations for every LLM, a standardized protocol is required.

## Decision
Adopt the Model Context Protocol (MCP) as the primary contract for AI integrations (`packages/ai/*`).
- MCP tools expose ERP actions: `customer_lookup`, `invoice_create`, `quote_create`, and `reporting`.
- MCP resources expose canonical OpenAPI schemas for dynamic prompting and validation.

## Consequences
- Single implementation of accounting tools is usable by Claude Desktop, Cursor, and any MCP-compliant client.
- Zero impedance mismatch between LLM function calling and ERP transactions.
