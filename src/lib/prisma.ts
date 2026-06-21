import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

type PrismaInstance = ReturnType<typeof makePrisma>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaInstance | undefined };

function makePrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

function getClient(): PrismaInstance {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = makePrisma();
  }
  return globalForPrisma.prisma;
}

// Proxy defers PrismaClient instantiation to the first actual DB call,
// preventing build-time failures when DATABASE_URL is absent (e.g. Docker build).
export const prisma: PrismaInstance = new Proxy({} as PrismaInstance, {
  get(_, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
