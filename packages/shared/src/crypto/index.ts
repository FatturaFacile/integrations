import * as crypto from 'node:crypto';

export interface EncryptedPayload {
  iv: string;         // Hex
  authTag: string;    // Hex
  ciphertext: string; // Hex
}

export function encryptAes256Gcm(plainText: string, secretKeyHex: string): EncryptedPayload {
  const key = Buffer.from(secretKeyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('Invalid key length for AES-256-GCM: must be 32 bytes (64 hex characters)');
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    authTag,
    ciphertext: encrypted
  };
}

export function decryptAes256Gcm(payload: EncryptedPayload, secretKeyHex: string): string {
  const key = Buffer.from(secretKeyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('Invalid key length for AES-256-GCM: must be 32 bytes (64 hex characters)');
  }

  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.authTag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function computeHmacSha256(data: string | Buffer, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export function computeHmacSha256Base64(data: string | Buffer, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('base64');
}

export function secureCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
