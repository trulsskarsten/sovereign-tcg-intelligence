import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM.
 * The salt/key must be provided via SHOPIFY_CLIENT_SECRET.
 */
export function encrypt(text: string): string {
  const secret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!secret) throw new Error("SHOPIFY_CLIENT_SECRET is not defined");

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(secret, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // Combine IV, Tag, and Encrypted Content
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a string encrypted with the above function.
 */
export function decrypt(encryptedData: string): string {
  const secret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!secret) throw new Error("SHOPIFY_CLIENT_SECRET is not defined");

  const [ivHex, tagHex, encryptedHex] = encryptedData.split(':');
  if (!ivHex || !tagHex || !encryptedHex) throw new Error("Invalid encrypted data format");

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const key = crypto.scryptSync(secret, 'salt', 32);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
