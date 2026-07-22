import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'

// Extend FastifyInstance type so TypeScript knows about prisma
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

/**
 * Connects Prisma to Fastify and decorates the instance.
 * Use this plugin to access Prisma via `fastify.prisma` in your routes and hooks.
 */
async function prismaPlugin(fastify: FastifyInstance) {
  const prisma = new PrismaClient({
    log: ['warn', 'error'],
  })

  // Connect to database
  await prisma.$connect()

  // Make prisma available on fastify.prisma
  fastify.decorate('prisma', prisma)

  // Disconnect when Fastify shuts down
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
}

export default fp(prismaPlugin, { name: 'prisma' })
