const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const ivLength = 16;

/**
 * Gets the encryption key from environment variables.
 * Ensures the key is exactly 32 bytes for AES-256-CBC.
 */
const getKey = () => {
  const secret = (process.env.KYC_SECRET || '').trim();
  if (!secret) {
    throw new Error('KYC_SECRET is not defined in environment variables');
  }
  const key = Buffer.from(secret, 'hex');
  if (key.length !== 32) {
    throw new Error(`Invalid KYC_SECRET length: expected 32 bytes (64 hex characters), got ${key.length} bytes`);
  }
  return key;
};

/**
 * Encrypts sensitive text using AES-256-CBC
 */
exports.encrypt = (text) => {
  if (!text) return null;
  const key = getKey();
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts sensitive text using AES-256-CBC
 */
exports.decrypt = (text) => {
  if (!text || !text.includes(':')) return text; // Return as-is if not in our format
  const [ivHex, encryptedText] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = getKey();
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
