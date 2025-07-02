
// Secure logging utility with environment-based controls
class Logger {
  private static isDevelopment = import.meta.env.MODE === 'development';
  
  // Safe logging that respects environment
  static info(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, data);
    }
  }

  static warn(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.warn(`⚠️ ${message}`, data);
    } else {
      // In production, only log essential warnings
      console.warn(message);
    }
  }

  static error(message: string, error?: any): void {
    if (this.isDevelopment) {
      console.error(`❌ ${message}`, error);
    } else {
      // In production, log sanitized error messages
      console.error(message);
    }
  }

  // Debug logs only in development
  static debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`🐛 ${message}`, data);
    }
  }

  // Success logs with minimal data exposure
  static success(message: string): void {
    if (this.isDevelopment) {
      console.log(`✅ ${message}`);
    }
  }
}

export default Logger;
