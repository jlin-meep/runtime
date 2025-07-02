
// Encryption utilities for sensitive data
export class SecurityUtils {
  private static readonly ENCRYPTION_KEY_NAME = 'app_encryption_key';

  // Generate or retrieve encryption key
  private static async getEncryptionKey(): Promise<CryptoKey> {
    const keyData = localStorage.getItem(this.ENCRYPTION_KEY_NAME);
    
    if (keyData) {
      const keyBuffer = new Uint8Array(JSON.parse(keyData));
      return await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    }

    // Generate new key
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const exportedKey = await crypto.subtle.exportKey('raw', key);
    localStorage.setItem(this.ENCRYPTION_KEY_NAME, JSON.stringify(Array.from(new Uint8Array(exportedKey))));
    return key;
  }

  // Encrypt sensitive data
  static async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
      );

      const result = {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted))
      };

      return btoa(JSON.stringify(result));
    } catch (error) {
      console.warn('Encryption failed, storing data unencrypted');
      return data;
    }
  }

  // Decrypt sensitive data
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const { iv, data } = JSON.parse(atob(encryptedData));
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(data)
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.warn('Decryption failed, returning data as-is');
      return encryptedData;
    }
  }

  // Input validation utilities
  static sanitizeAddressInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove potentially harmful characters and limit length
    return input
      .replace(/[<>\"'&]/g, '') // Remove HTML/script injection characters
      .replace(/[^\w\s,.-]/g, '') // Allow only alphanumeric, spaces, commas, periods, hyphens
      .trim()
      .substring(0, 200); // Reasonable address length limit
  }

  static validateCoordinates(coordinates: [number, number]): boolean {
    const [lng, lat] = coordinates;
    return (
      typeof lng === 'number' && 
      typeof lat === 'number' &&
      lng >= -180 && lng <= 180 &&
      lat >= -90 && lat <= 90 &&
      !isNaN(lng) && !isNaN(lat)
    );
  }

  // Sanitize error messages for user display
  static sanitizeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      // Don't expose internal error details to users
      if (error.message.includes('API') || error.message.includes('fetch')) {
        return 'Unable to connect to weather service. Please check your internet connection.';
      }
      if (error.message.includes('location') || error.message.includes('coordinates')) {
        return 'Invalid location. Please try a different address or location.';
      }
      return 'An unexpected error occurred. Please try again.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
}

// Secure localStorage wrapper
export class SecureStorage {
  static async setItem(key: string, value: string): Promise<void> {
    const encryptedValue = await SecurityUtils.encrypt(value);
    localStorage.setItem(`secure_${key}`, encryptedValue);
  }

  static async getItem(key: string): Promise<string | null> {
    const encryptedValue = localStorage.getItem(`secure_${key}`);
    if (!encryptedValue) return null;
    
    return await SecurityUtils.decrypt(encryptedValue);
  }

  static removeItem(key: string): void {
    localStorage.removeItem(`secure_${key}`);
  }
}
