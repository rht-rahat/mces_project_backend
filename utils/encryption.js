const crypto = require('crypto');

// Must be 256 bits (32 characters)
const DEFAULT_KEY = 'mces_secure_encryption_key_2026!'; // 32 bytes
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

const getSecretKey = () => {
  const key = process.env.ENCRYPTION_KEY || DEFAULT_KEY;
  // Ensure the key is exactly 32 bytes
  if (key.length >= 32) {
    return Buffer.from(key.substring(0, 32));
  }
  return Buffer.from(key.padEnd(32, '0'));
};

const encrypt = (text) => {
  try {
    if (!text) return '';
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getSecretKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; // Fallback to plain text on error
  }
};

const decrypt = (encryptedText) => {
  try {
    if (!encryptedText) return '';
    if (!encryptedText.includes(':')) {
      // If the string is not formatted as "iv:encryptedText", it might be unencrypted legacy data
      return encryptedText;
    }
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedTextPart = parts.join(':');
    const key = getSecretKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedTextPart, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return 'Decryption Error (Incorrect Key/Data)';
  }
};

module.exports = {
  encrypt,
  decrypt
};
