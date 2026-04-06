import crypto from 'crypto';

// The key must be exactly 32 bytes (256 bits) for aes-256-gcm.
// We expect it to be a hex string in the environment variable.
const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const keyHex = process.env.PAYMENT_ENCRYPTION_KEY;
  if (!keyHex) {
    // Para entornos de desarrollo sin la variable configurada, podríamos hacer fallback a un default,
    // pero es mejor obligar a tener la llave para evitar falsos positivos de seguridad.
    // Usaremos un string hardcodeado SOLO si no hay llave para no romper desarrollo si se olvidan,
    // pero lanzaremos un warning para avisar. En producción debe estar configurada.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PAYMENT_ENCRYPTION_KEY environment variable is not defined.');
    }
    console.warn('⚠️ WARNING: PAYMENT_ENCRYPTION_KEY is missing. Using a fallback key for development only.');
    return crypto.createHash('sha256').update('fallback-dev-key').digest();
  }
  
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('PAYMENT_ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters) for aes-256-gcm.');
  }
  return key;
}

/**
 * Encrypts a plain text string using aes-256-gcm.
 * Format: iv:authTag:encryptedData (all in hex)
 */
export function encryptToken(text: string): string {
  if (!text) return text;
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12); // 96 bits is recommended for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, iv, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Error encrypting token:', error);
    throw new Error('Failed to encrypt sensitive data.');
  }
}

/**
 * Decrypts a string that was encrypted with encryptToken.
 * Expects format: iv:authTag:encryptedData (all in hex)
 * If the string does not match the format (e.g., legacy unencrypted token), it returns it as is.
 */
export function decryptToken(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  // Check if it matches the format of our encryption
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    // Consider it a legacy unencrypted token
    return encryptedText;
  }
  
  try {
    const [ivHex, authTagHex, encryptedDataHex] = parts;
    const key = getEncryptionKey();
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, iv, key);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting token:', error);
    throw new Error('Failed to decrypt sensitive data. The key might have changed.');
  }
}
