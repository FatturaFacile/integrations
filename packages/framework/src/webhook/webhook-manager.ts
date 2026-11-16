import {
  computeHmacSha256,
  computeHmacSha256Base64,
  secureCompare,
  Logger
} from '@fatturafacile/shared';

export interface WebhookVerificationContext {
  rawBody: string | Buffer;
  headers: Record<string, string | string[] | undefined>;
  secret: string;
  toleranceSeconds?: number | undefined;
}

export interface WebhookVerificationResult {
  valid: boolean;
  error?: string | undefined;
  timestamp?: number | undefined;
}

export type WebhookVerifier = (context: WebhookVerificationContext) => WebhookVerificationResult;

export class WebhookManager {
  private readonly verifiers = new Map<string, WebhookVerifier>();
  private readonly logger: Logger;

  constructor(logger?: Logger | undefined) {
    this.logger = logger ?? new Logger({ component: 'WebhookManager' });
    this.logger.debug('Initialized WebhookManager');
    this.registerStandardVerifiers();
  }

  public registerVerifier(platform: string, verifier: WebhookVerifier): void {
    this.verifiers.set(platform.toLowerCase(), verifier);
  }

  public verify(platform: string, context: WebhookVerificationContext): WebhookVerificationResult {
    const verifier = this.verifiers.get(platform.toLowerCase());
    if (!verifier) {
      return { valid: false, error: `No verifier registered for platform '${platform}'` };
    }
    return verifier(context);
  }

  private registerStandardVerifiers(): void {
    // 1. Shopify HMAC SHA256 (Base64 header 'x-shopify-hmac-sha256')
    this.registerVerifier('shopify', ({ rawBody, headers, secret }) => {
      const signature = (headers['x-shopify-hmac-sha256'] || headers['X-Shopify-Hmac-Sha256']) as string | undefined;
      if (!signature) {
        return { valid: false, error: 'Missing x-shopify-hmac-sha256 header' };
      }
      const calculated = computeHmacSha256Base64(rawBody, secret);
      const valid = secureCompare(signature, calculated);
      return { valid, error: valid ? undefined : 'Invalid signature' };
    });

    // 2. WooCommerce HMAC SHA256 (Base64 header 'x-wc-webhook-signature')
    this.registerVerifier('woocommerce', ({ rawBody, headers, secret }) => {
      const signature = (headers['x-wc-webhook-signature'] || headers['X-WC-Webhook-Signature']) as string | undefined;
      if (!signature) {
        return { valid: false, error: 'Missing x-wc-webhook-signature header' };
      }
      const calculated = computeHmacSha256Base64(rawBody, secret);
      const valid = secureCompare(signature, calculated);
      return { valid, error: valid ? undefined : 'Invalid signature' };
    });

    // 3. Stripe signature: t=timestamp,v1=signature
    this.registerVerifier('stripe', ({ rawBody, headers, secret, toleranceSeconds = 300 }) => {
      const header = (headers['stripe-signature'] || headers['Stripe-Signature']) as string | undefined;
      if (!header) {
        return { valid: false, error: 'Missing stripe-signature header' };
      }

      const elements = header.split(',');
      let timestamp = 0;
      const signatures: string[] = [];

      for (const item of elements) {
        const [k, v] = item.trim().split('=');
        if (k === 't' && v) {
          timestamp = parseInt(v, 10);
        } else if (k === 'v1' && v) {
          signatures.push(v);
        }
      }

      if (!timestamp || signatures.length === 0) {
        return { valid: false, error: 'Malformed stripe-signature header' };
      }

      const now = Math.floor(Date.now() / 1000);
      if (toleranceSeconds > 0 && Math.abs(now - timestamp) > toleranceSeconds) {
        return { valid: false, error: 'Webhook timestamp outside tolerance range', timestamp };
      }

      const payload = `${timestamp}.${typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')}`;
      const expected = computeHmacSha256(payload, secret);

      const valid = signatures.some((sig) => secureCompare(sig, expected));
      return { valid, error: valid ? undefined : 'No matching signature found', timestamp };
    });

    // 4. Standard Generic HMAC SHA256 (Hex header 'x-hub-signature-256')
    this.registerVerifier('generic', ({ rawBody, headers, secret }) => {
      const header = (headers['x-hub-signature-256'] || headers['X-Hub-Signature-256']) as string | undefined;
      if (!header) {
        return { valid: false, error: 'Missing x-hub-signature-256 header' };
      }
      const signature = header.startsWith('sha256=') ? header.slice(7) : header;
      const calculated = computeHmacSha256(rawBody, secret);
      const valid = secureCompare(signature, calculated);
      return { valid, error: valid ? undefined : 'Invalid signature' };
    });
  }
}
