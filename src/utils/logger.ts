/**
 * A simple utility for standardized application logging.
 * Logs are enabled only in development mode unless forcefully configured otherwise.
 */

type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';

  private formatMessage(level: LogLevel, context: string, message: string) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
  }

  info(context: string, message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', context, message), data ? data : '');
    }
  }

  warn(context: string, message: string, data?: any) {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', context, message), data ? data : '');
    }
  }

  error(context: string, message: string, error?: any) {
    // Errors should generally always be logged, even in production
    console.error(this.formatMessage('error', context, message), error ? error : '');
  }
}

export const logger = new Logger();
