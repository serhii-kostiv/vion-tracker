import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark endpoints as public (bypass JWT authentication)
 *
 * @example
 * ```typescript
 * @Public()
 * @Get('public-endpoint')
 * getPublicData() {
 *   return { message: 'This is public' };
 * }
 * ```
 */
export const Public = () => SetMetadata('isPublic', true);
