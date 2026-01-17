/**
 * Simple logger utility
 * Ready for future integration with structured logging services
 */

enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private formatLog(level: LogLevel, message: string, metadata?: Record<string, unknown>): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(metadata && { metadata }),
    };
    return JSON.stringify(entry);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    console.log(this.formatLog(LogLevel.INFO, message, metadata));
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn(this.formatLog(LogLevel.WARN, message, metadata));
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    console.error(this.formatLog(LogLevel.ERROR, message, metadata));
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog(LogLevel.DEBUG, message, metadata));
    }
  }
}

export const logger = new Logger();

