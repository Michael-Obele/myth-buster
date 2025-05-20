import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

// Use a single instance of Prisma Client in development
// to prevent hot reloading from creating multiple instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (dev) globalForPrisma.prisma = prisma;
