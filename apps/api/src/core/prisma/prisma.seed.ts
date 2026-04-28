import 'dotenv/config';
import { PrismaClient } from '@repo/database';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const demoPassword = 'changeme';
  const demoPasswordHash = await argon2.hash(demoPassword);

  // Базовий користувач
  await prisma.user.upsert({
    where: { email: 'demo@viontrack.app' },
    update: {
      password: demoPasswordHash,
    },
    create: {
      name: 'Demo User',
      email: 'demo@viontrack.app',
      password: demoPasswordHash,
      defaultCurrency: 'UAH',
      avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
