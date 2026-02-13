import { PrismaClient } from "@prisma/client";

declare global { var __prisma: PrismaClient | undefined; }

function createClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Create a .env file or set Railway Variables.");
  }
  return new PrismaClient();
}

export const prisma: PrismaClient = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;
