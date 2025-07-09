import { PrismaClient } from "@prisma/client";

/**
 * Extend the globalThis namespace to add a custom `prismadb` property.
 * This avoids issues in Next.js or long-lived server environments
 * by reusing a single PrismaClient instance across hot reloads.
 */
declare global {
  namespace globalThis {
    var prismadb: PrismaClient;
  }
}

/**
 * Create a new PrismaClient instance.
 */
const prisma = new PrismaClient();

/**
 * In production, always create a new PrismaClient instance.
 * In development, you might attach it to the global object
 * to prevent multiple instances during hot reloads
 * (to avoid "too many connections" errors in development).
 */
if (process.env.NODE_ENV === "production") global.prismadb = prisma;

/**
 * Export the Prisma client for use throughout your app.
 */
export default prisma;
