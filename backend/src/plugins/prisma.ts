import { PrismaClient } from '@prisma/client'

/**
 * Singleton Prisma client.
 * Import this in every service file that needs DB access.
 */
export const prisma = new PrismaClient({
  log: ['warn', 'error'],
})
