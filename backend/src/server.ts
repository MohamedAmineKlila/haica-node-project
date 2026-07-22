/**
 * server.ts — HAICA RBAC Admin API
 *
 * Start with:  npm run dev  (inside /backend)
 * API Docs:    http://localhost:3000/docs
 */
import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import staticFiles from '@fastify/static'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

import { config } from './config'
import { prisma } from './plugins/prisma'
import dbPlugin from './plugins/db'

import { authRoutes }        from './modules/auth/auth.routes'
import { usersRoutes }       from './modules/users/users.routes'
import { rolesRoutes }       from './modules/roles/roles.routes'
import { permissionsRoutes } from './modules/permissions/permissions.routes'
import { auditRoutes }           from './modules/audit/audit.routes'
import { dashboardRoutes }       from './modules/dashboard/dashboard.routes'
import { notificationRoutes }    from './modules/notifications/notification.routes'
import { reportsRoutes }         from './modules/reports/reports.routes'

// Augment JWT payload type (used in request.user after jwtVerify)
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string }
    user:    { id: string; email: string }
  }
}

async function buildServer() {
  const fastify = Fastify({ logger: true })

  // ── CORS ──────────────────────────────────────────────────────────────
  await fastify.register(cors, {
    origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })

  // ── Database (Prisma) ────────────────────────────────────────────────
  await fastify.register(dbPlugin)

  // ── JWT ───────────────────────────────────────────────────────────────
  await fastify.register(jwt, {
    secret: config.jwtSecret,
    sign:   { expiresIn: '15m', algorithm: 'HS256' },
  })

  // ── Rate Limiting ─────────────────────────────────────────────────────
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  // ── Multipart (avatar uploads) ─────────────────────────────────────────
  await fastify.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  })

  // ── Static files (/uploads) ────────────────────────────────────────────
  const uploadsDir = path.join(process.cwd(), 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  await fastify.register(staticFiles, { root: uploadsDir, prefix: '/uploads/' })

  // ── Swagger API docs ───────────────────────────────────────────────────
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'HAICA Admin API',
        version: '1.0.0',
        description: 'Role-Based Access Control Platform for HAICA',
      },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  })
  await fastify.register(swaggerUi, { routePrefix: '/docs' })

  // ── Routes ─────────────────────────────────────────────────────────────
  await fastify.register(authRoutes,        { prefix: '/api/auth' })
  await fastify.register(usersRoutes,       { prefix: '/api/users' })
  await fastify.register(rolesRoutes,       { prefix: '/api/roles' })
  await fastify.register(permissionsRoutes, { prefix: '/api/permissions' })
  await fastify.register(auditRoutes,        { prefix: '/api/audit' })
  await fastify.register(dashboardRoutes,   { prefix: '/api/dashboard' })
  await fastify.register(notificationRoutes, { prefix: '/api/notifications' })
  await fastify.register(reportsRoutes,      { prefix: '/api/reports' })

  // ── Health check ────────────────────────────────────────────────────────
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // ── Global error handler ────────────────────────────────────────────────
  fastify.setErrorHandler((error, _req, reply) => {
    // Friendly Prisma unique constraint violations
    if ('code' in error && error.code === 'P2002') {
      const target = (error as any).meta?.target ?? []
      const field = Array.isArray(target) ? target[0] : 'field'
      return reply.code(409).send({ error: `Un ${field === 'email' ? 'email' : 'élément'} avec cette valeur existe déjà.` })
    }
    const statusCode = error.statusCode || 500
    reply.code(statusCode).send({ error: error.message || 'Internal Server Error' })
  })

  return fastify
}

async function main() {
  const fastify = await buildServer()
  try {
    await fastify.listen({ port: config.port, host: config.host })
    console.log('\n  HAICA Backend running at http://localhost:3000')
    console.log('  API Docs:              http://localhost:3000/docs\n')
  } catch (err) {
    fastify.log.error(err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

main()
