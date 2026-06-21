/* eslint-disable no-console */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [users, locations, reviews] = await Promise.all([
    prisma.user.count(),
    prisma.location.count(),
    prisma.review.count(),
  ]);

  console.log(`Rows — users: ${users}, locations: ${locations}, reviews: ${reviews}`);
  console.log('✅ Connected');
}

main()
  .catch((e) => {
    console.error('❌ Connection/read failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
