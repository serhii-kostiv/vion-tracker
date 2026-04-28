import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Типізація для NestJS exception response
 */
interface HttpExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

/**
 * Типізація для authenticated request
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Global exception filter для стандартизації всіх HTTP error responses
 * Забезпечує консистентний формат помилок та structured logging
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthenticatedRequest>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Витягуємо message з response (може бути string або object)
    const message = this.extractMessage(exceptionResponse, exception.message);

    // Стандартизований формат error response
    const errorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Structured logging з контекстом
    const logContext = {
      statusCode: status,
      method: request.method,
      path: request.url,
      message,
      userId: request.user?.id,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };

    // Логуємо з відповідним рівнем
    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      // 5xx errors - server errors (потребують уваги)
      this.logger.error('Server error occurred', {
        ...logContext,
        stack: exception.stack,
      });
    } else if (status >= Number(HttpStatus.BAD_REQUEST)) {
      // 4xx errors - client errors (нормальна поведінка)
      this.logger.warn('Client error occurred', logContext);
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Витягує message з exception response
   */
  private extractMessage(
    exceptionResponse: string | object,
    fallbackMessage: string,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    const responseObj = exceptionResponse as HttpExceptionResponse;
    return responseObj.message || fallbackMessage;
  }

  /**
   * Видаляє sensitive data з логів (passwords, tokens, тощо)
   */
  private filterSensitiveData(logContext: Record<string, unknown>): void {
    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret'];

    for (const field of sensitiveFields) {
      if (field in logContext) {
        logContext[field] = '[FILTERED]';
      }
    }
  }
}
