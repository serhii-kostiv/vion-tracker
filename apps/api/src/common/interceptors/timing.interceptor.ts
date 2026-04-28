import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Interceptor для моніторингу performance HTTP requests
 * Логує тривалість кожного request та попереджає про повільні запити
 */
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly slowRequestThreshold = 1000; // 1 секунда

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        // Логуємо всі requests
        this.logger.log(`${method} ${url} - ${duration}ms`);

        // Попереджаємо про повільні requests
        if (duration > this.slowRequestThreshold) {
          this.logger.warn(
            `Slow request detected: ${method} ${url} - ${duration}ms`,
            {
              method,
              url,
              duration,
              threshold: this.slowRequestThreshold,
            },
          );
        }
      }),
    );
  }
}
