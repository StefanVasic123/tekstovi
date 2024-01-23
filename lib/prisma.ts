// NextJS hot reload: everytime we reload prisma client (storing prisma on globalThis)
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  prisma = globalWithPrisma.prisma;
}

export default prisma;

// concise way for writing this logic
/*
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'production') globalThis.prisma = prisma;
*/
