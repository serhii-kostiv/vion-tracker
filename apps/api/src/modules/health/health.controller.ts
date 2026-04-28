import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '@/common/decorators/public.decorator';

/**
 * Health Check Controller
 *
 * Provides endpoints for monitoring application health
 * All endpoints are public (no authentication required)
 */
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Basic health check
   *
   * @returns Health status with timestamp
   */
  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  check() {
    return this.healthService.check();
  }

  /**
   * Database health check
   *
   * @returns Database connection status
   */
  @Get('db')
  @Public()
  @HttpCode(HttpStatus.OK)
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }
}
