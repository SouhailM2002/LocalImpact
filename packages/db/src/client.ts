import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  localImpactPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.localImpactPrisma ?? new PrismaClient();

globalForPrisma.localImpactPrisma = prisma;
