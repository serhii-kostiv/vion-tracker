import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
  Type,
} from '@nestjs/common';
import { Prisma } from '@repo/database';
import { Request, Response } from 'express';

/**
 * Типізація для Prisma error meta
 */
interface PrismaErrorMeta {
  target?: string[];
  field_name?: string;
  constraint?: string;
}

/**
 * Exception filter для обробки Prisma database помилок
 * Трансформує Prisma-специфічні помилки в HTTP exceptions з відповідними статус кодами
 */
@Catch(
  Prisma.PrismaClientKnownRequestError as unknown as Type<Prisma.PrismaClientKnownRequestError>,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.mapPrismaErrorToHttp(exception);

    this.logger.error('Prisma database error', {
      code: exception.code,
      message: errorResponse.message,
      path: request.url,
      method: request.method,
      meta: exception.meta,
    });

    response.status(errorResponse.status).json({
      statusCode: errorResponse.status,
      message: errorResponse.message,
      error: exception.code,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  /**
   * Мапінг Prisma error codes на HTTP статус коди та повідомлення
   */
  private mapPrismaErrorToHttp(
    exception: Prisma.PrismaClientKnownRequestError,
  ): { status: number; message: string } {
    const meta = exception.meta as PrismaErrorMeta | undefined;

    switch (exception.code) {
      case 'P2002': {
        // Unique constraint violation
        const target = meta?.target;
        const field = target?.[0] ?? 'field';
        return {
          status: HttpStatus.CONFLICT,
          message: `A record with this ${field} already exists`,
        };
      }

      case 'P2025': {
        // Record not found
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
        };
      }

      case 'P2003': {
        // Foreign key constraint violation
        const fieldName = meta?.field_name;
        return {
          status: HttpStatus.BAD_REQUEST,
          message: fieldName
            ? `Invalid reference: ${fieldName}`
            : 'Invalid reference',
        };
      }

      case 'P2001': {
        // Record does not exist
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'The record does not exist',
        };
      }

      case 'P2014': {
        // Invalid relation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid relation between records',
        };
      }

      case 'P2011': {
        // Null constraint violation
        const constraintField = meta?.constraint;
        return {
          status: HttpStatus.BAD_REQUEST,
          message: constraintField
            ? `Field ${constraintField} cannot be null`
            : 'Required field is missing',
        };
      }

      default: {
        // Невідома Prisma помилка
        this.logger.warn(`Unhandled Prisma error code: ${exception.code}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database operation failed',
        };
      }
    }
  }
}
