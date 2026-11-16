import { describe, it, expect } from 'vitest';
import { PostmanConnector } from '../src/index.js';

describe('PostmanConnector', () => {
  it('should initialize successfully', async () => {
    const connector = new PostmanConnector();
    const result = await connector.initialize({
      tenantId: 'tenant-test-123',
      organizationId: 'org-test-456',
      config: {}
    });
    expect(result.success).toBe(true);
  });

  it('should generate valid Postman v2.1 collection', () => {
    const connector = new PostmanConnector();
    const collection = connector.generatePostmanCollection();
    expect(collection.info.name).toBe('FatturaFacile ERP REST API');
    expect(collection.item.length).toBeGreaterThanOrEqual(2);
    expect(collection.item[0]?.name).toBe('Create Invoice');
  });
});
