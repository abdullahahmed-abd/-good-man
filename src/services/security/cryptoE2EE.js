/**
 * Insaan Client-Side Zero-Knowledge E2EE Service
 * Uses Web Crypto API:
 * - PBKDF2 key derivation (600,000 iterations, SHA-256)
 * - AES-GCM 256-bit encryption with unique 12-byte random IV per cipher
 * - Keys are held strictly in volatile memory (never saved to localStorage or disk)
 */

class CryptoE2EE {
  constructor() {
    this.cryptoKey = null;
    this.isEnabled = false;
  }

  hasKey() {
    return this.cryptoKey !== null;
  }

  clearKey() {
    this.cryptoKey = null;
    this.isEnabled = false;
  }

  // Derive AES-GCM 256-bit key from user passphrase and user email salt
  async initializeKey(passphrase, userSalt = 'insaan_default_user_salt') {
    if (!passphrase) throw new Error('Passphrase is required for E2EE key derivation.');

    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const salt = enc.encode(`insaan_e2ee_${userSalt}`);

    this.cryptoKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 600000, // OWASP 2023+ recommendation
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    this.isEnabled = true;
    return true;
  }

  // Encrypt plaintext into string: "ENC:v1:<base64(iv + ciphertext)>"
  async encrypt(plaintext) {
    if (!this.cryptoKey || !plaintext) return plaintext;

    try {
      const enc = new TextEncoder();
      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
      const encodedData = enc.encode(plaintext);

      const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.cryptoKey,
        encodedData
      );

      // Concatenate IV (12 bytes) + Ciphertext
      const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(cipherBuffer), iv.length);

      // Base64 encode
      const binaryString = Array.from(combined).map(b => String.fromCharCode(b)).join('');
      const base64 = btoa(binaryString);

      return `ENC:v1:${base64}`;
    } catch (err) {
      console.error('Encryption failed:', err);
      return plaintext; // Fallback to raw if crypto error
    }
  }

  // Decrypt cipher string or return as-is if plaintext
  async decrypt(ciphertext) {
    if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.startsWith('ENC:v1:')) {
      return ciphertext; // Not encrypted
    }

    if (!this.cryptoKey) {
      return '[Encrypted Entry — Unlock with Passphrase in Settings]';
    }

    try {
      const base64 = ciphertext.substring(7);
      const binaryString = atob(base64);
      const combined = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        combined[i] = binaryString.charCodeAt(i);
      }

      const iv = combined.slice(0, 12);
      const cipherBytes = combined.slice(12);

      const decBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.cryptoKey,
        cipherBytes
      );

      const dec = new TextDecoder();
      return dec.decode(decBuffer);
    } catch (err) {
      return '[Decryption failed: Incorrect passphrase]';
    }
  }
}

export const cryptoE2EE = new CryptoE2EE();
export default cryptoE2EE;
