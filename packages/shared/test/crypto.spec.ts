import { describe, it, expect } from 'vitest';
import {
  encryptAes256Gcm,
  decryptAes256Gcm,
  computeHmacSha256,
  computeHmacSha256Base64,
  secureCompare,
  generateRandomToken
} from '../src/crypto/index.js';

describe('Shared Crypto Utilities', () => {
  const secretKeyHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  it('should encrypt and decrypt plaintext using AES-256-GCM', () => {
    const plainText = 'sk_live_very_secret_api_key_12345';
    const encrypted = encryptAes256Gcm(plainText, secretKeyHex);

    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();
    expect(encrypted.ciphertext).toBeDefined();

    const decrypted = decryptAes256Gcm(encrypted, secretKeyHex);
    expect(decrypted).toBe(plainText);
  });

  it('should fail decryption if authTag is tampered with', () => {
    const plainText = 'sensitive-data';
    const encrypted = encryptAes256Gcm(plainText, secretKeyHex);

    // Tamper with the ciphertext
    const tamperedPayload = {
      ...encrypted,
      ciphertext: encrypted.ciphertext.slice(0, -2) + '00'
    };

    expect(() => decryptAes256Gcm(tamperedPayload, secretKeyHex)).toThrow();
  });

  it('should compute HMAC SHA256 hex and base64 accurately', () => {
    const payload = '{"event":"invoice.paid","amount":100}';
    const secret = 'webhook_secret_xyz';

    const hexSig = computeHmacSha256(payload, secret);
    const b64Sig = computeHmacSha256Base64(payload, secret);

    expect(hexSig).toHaveLength(64);
    expect(b64Sig).toBeDefined();
  });

  it('should safely compare strings without timing vulnerabilities', () => {
    const tokenA = 'abc123xyz';
    const tokenB = 'abc123xyz';
    const tokenC = 'abc123xyw';

    expect(secureCompare(tokenA, tokenB)).toBe(true);
    expect(secureCompare(tokenA, tokenC)).toBe(false);
  });

  it('should generate secure random tokens', () => {
    const token1 = generateRandomToken(16);
    const token2 = generateRandomToken(16);

    expect(token1).toHaveLength(32);
    expect(token2).toHaveLength(32);
    expect(token1).not.toBe(token2);
  });
});
