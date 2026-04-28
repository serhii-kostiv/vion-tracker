import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AppLoggerService } from '@/core/logging/logger.service';

/**
 * Health Check Service
 *
 * Monitors application health including database and external APIs
 */
@Injectable()
export class HealthService {
  private readonly logger = new AppLoggerService();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(HealthService.name);
  }

  /**
   * Basic health check
   *
   * @returns Application status and timestamp
   */
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Database health check
   *
   * Performs a simple query to verify database connectivity
   *
   * @returns Database connection status
   * @throws ServiceUnavailableException if database is unreachable
   */
  async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      this.logger.debug('Database health check passed');

      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Database health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new ServiceUnavailableException('Database is unavailable');
    }
  }
}
