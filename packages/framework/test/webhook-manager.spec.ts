import { describe, it, expect } from 'vitest';
import { WebhookManager } from '../src/webhook/webhook-manager.js';
import { computeHmacSha256, computeHmacSha256Base64 } from '@fatturafacile/shared';

describe('Framework WebhookManager', () => {
  const manager = new WebhookManager();

  it('should verify Shopify webhooks using base64 HMAC', () => {
    const secret = 'shopify_secret_key_123';
    const body = '{"id":123456,"email":"buyer@example.com"}';
    const signature = computeHmacSha256Base64(body, secret);

    const result = manager.verify('shopify', {
      rawBody: body,
      secret,
      headers: {
        'x-shopify-hmac-sha256': signature
      }
    });

    expect(result.valid).toBe(true);
  });

  it('should reject Shopify webhooks with bad signature', () => {
    const result = manager.verify('shopify', {
      rawBody: '{"test":1}',
      secret: 'secret',
      headers: {
        'x-shopify-hmac-sha256': 'invalid-signature'
      }
    });

    expect(result.valid).toBe(false);
  });

  it('should verify Stripe webhooks with timestamp and tolerance', () => {
    const secret = 'whsec_test_secret';
    const body = '{"id":"evt_123","type":"payment_intent.succeeded"}';
    const now = Math.floor(Date.now() / 1000);
    const signature = computeHmacSha256(`${now}.${body}`, secret);

    const result = manager.verify('stripe', {
      rawBody: body,
      secret,
      headers: {
        'stripe-signature': `t=${now},v1=${signature}`
      },
      toleranceSeconds: 300
    });

    expect(result.valid).toBe(true);
  });

  it('should reject expired Stripe webhooks exceeding tolerance', () => {
    const secret = 'whsec_test_secret';
    const body = '{"id":"evt_123"}';
    const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const signature = computeHmacSha256(`${oldTimestamp}.${body}`, secret);

    const result = manager.verify('stripe', {
      rawBody: body,
      secret,
      headers: {
        'stripe-signature': `t=${oldTimestamp},v1=${signature}`
      },
      toleranceSeconds: 300
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('outside tolerance range');
  });
});
