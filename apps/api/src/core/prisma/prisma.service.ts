import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient, Prisma, PrismaPg } from '@repo/database';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected gracefully');
  }

  /**
   * Helper для "find or fail" pattern
   * Знаходить запис або викидає NotFoundException
   */
  async findUniqueOrThrow<T>(
    model: Prisma.ModelName,
    args: unknown,
    errorMessage?: string,
  ): Promise<T> {
    const delegate = this[model as keyof PrismaClient] as {
      findUnique: (args: unknown) => Promise<T | null>;
    };

    const result = await delegate.findUnique(args);

    if (!result) {
      throw new NotFoundException(errorMessage || `${model} not found`);
    }

    return result;
  }
}
