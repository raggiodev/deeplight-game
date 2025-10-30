/**
 * Singleton logger for consistent logging across the application
 */
export class Logger {
  private static instance: Logger;
  private enabled: boolean;

  private constructor() {
    this.enabled = import.meta.env.DEV;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, ...args: any[]): void {
    if (this.enabled) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.enabled) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (this.enabled) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}
