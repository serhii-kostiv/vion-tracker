import {
  Injectable,
  Logger,
  LoggerService as NestLoggerService,
} from '@nestjs/common';

/**
 * Типізація для log context
 */
interface LogContext {
  [key: string]: unknown;
}

/**
 * Wrapper над NestJS Logger для structured logging з фільтрацією sensitive data
 */
@Injectable()
export class AppLoggerService implements NestLoggerService {
  private logger: Logger;
  private readonly sensitiveFields = [
    'password',
    'token',
    'refreshToken',
    'accessToken',
    'secret',
    'apiKey',
    'authorization',
  ];

  constructor(context?: string) {
    this.logger = new Logger(context ?? 'Application');
  }

  /**
   * Set logger context
   */
  setContext(context: string): void {
    this.logger = new Logger(context);
  }

  /**
   * Log з structured context
   */
  log(message: string, context?: LogContext): void {
    const sanitizedContext = this.filterSensitiveData(context);
    this.logger.log(message, sanitizedContext);
  }

  /**
   * Error log з structured context
   */
  error(message: string, context?: LogContext): void {
    const sanitizedContext = this.filterSensitiveData(context);
    this.logger.error(message, sanitizedContext);
  }

  /**
   * Warning log з structured context
   */
  warn(message: string, context?: LogContext): void {
    const sanitizedContext = this.filterSensitiveData(context);
    this.logger.warn(message, sanitizedContext);
  }

  /**
   * Debug log з structured context
   */
  debug(message: string, context?: LogContext): void {
    const sanitizedContext = this.filterSensitiveData(context);
    this.logger.debug(message, sanitizedContext);
  }

  /**
   * Verbose log з structured context
   */
  verbose(message: string, context?: LogContext): void {
    const sanitizedContext = this.filterSensitiveData(context);
    this.logger.verbose(message, sanitizedContext);
  }

  /**
   * Фільтрує sensitive data з log context
   */
  private filterSensitiveData(context?: LogContext): LogContext | undefined {
    if (!context) {
      return undefined;
    }

    const filtered: LogContext = { ...context };

    for (const key of Object.keys(filtered)) {
      const lowerKey = key.toLowerCase();

      // Перевіряємо чи ключ містить sensitive field
      if (this.sensitiveFields.some((field) => lowerKey.includes(field))) {
        filtered[key] = '[FILTERED]';
      }

      // Рекурсивно фільтруємо nested objects
      if (typeof filtered[key] === 'object' && filtered[key] !== null) {
        filtered[key] = this.filterSensitiveData(filtered[key] as LogContext);
      }
    }

    return filtered;
  }
}
