import { describe, it, expect, vi } from 'vitest';
import { ClaudeConnector } from '../src/index.js';
import { createMockCustomer, createMockInvoice } from '@fatturafacile/shared/test-utils';

describe('Anthropic Claude MCP Connector', () => {
  it('should initialize and list MCP tools and resources compliant with spec', async () => {
    const connector = new ClaudeConnector();
    const result = await connector.initialize({
      tenantId: 'tenant-claude-1',
      config: {},
      secrets: { ERP_API_KEY: 'test-key' }
    });

    expect(result.success).toBe(true);

    const mcp = connector.getMcpServer();
    const toolsRes = await mcp.handleRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    });

    expect(toolsRes.result?.['tools']).toHaveLength(4);

    const resourcesRes = await mcp.handleRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'resources/list'
    });

    expect(resourcesRes.result?.['resources']).toHaveLength(2);
  });

  it('should handle tools/call for fatturafacile_lookup_customer', async () => {
    const connector = new ClaudeConnector();
    await connector.initialize({
      tenantId: 'tenant-claude-1',
      config: {},
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.customers, 'findByVatOrEmail').mockResolvedValue(
      createMockCustomer({ businessName: 'Claude Enterprises S.p.A.' })
    );

    const mcp = connector.getMcpServer();
    const res = await mcp.handleRequest({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'fatturafacile_lookup_customer',
        arguments: { identifier: 'IT99988877701' }
      }
    });

    expect(res.error).toBeUndefined();
    const content = (res.result?.['content'] as any[])[0];
    expect(content.text).toContain('Claude Enterprises S.p.A.');
  });

  it('should handle tools/call for fatturafacile_create_invoice', async () => {
    const connector = new ClaudeConnector();
    await connector.initialize({
      tenantId: 'tenant-claude-1',
      config: {},
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.invoices, 'create').mockResolvedValue(
      createMockInvoice({
        id: 'inv_mcp_1',
        invoiceNumber: 'INV-2026-MCP1',
        totalGross: 122
      })
    );

    const mcp = connector.getMcpServer();
    const res = await mcp.handleRequest({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'fatturafacile_create_invoice',
        arguments: {
          customerId: 'cust_claude_1',
          description: 'AI model fine-tuning consulting',
          amountNet: 100,
          vatRatePercentage: 22
        }
      }
    });

    expect(res.error).toBeUndefined();
    const content = (res.result?.['content'] as any[])[0];
    expect(content.text).toContain('INV-2026-MCP1');
  });
});
