import { FastifyInstance } from 'fastify'
import crypto from 'crypto'
import { authenticate } from '../../middleware/authenticate'
import { logAudit } from '../../utils/auditLogger'
import { prisma } from '../../plugins/prisma'
import { userWithRole } from '../../types'
import { notifyAdmins } from '../notifications/notification.service'
import {
  loginService,
  refreshTokenService,
  logoutService,
  getMeService,
  updateProfileService,
} from './auth.service'

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login with email and password',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string }
    try {
      const result = await loginService(email, password, fastify, request.ip, request.headers['user-agent'])
      await logAudit({
        action: 'USER_LOGIN',
        userId: result.user.id,
        ip: request.ip,
        details: { email },
      })
      return reply.send(result)
    } catch (err: any) {
      return reply.code(err.statusCode || 500).send({ error: err.message })
    }
  })

  fastify.post('/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Exchange a refresh token for a new access token',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string }
    try {
      const result = await refreshTokenService(refreshToken, fastify)
      return reply.send(result)
    } catch (err: any) {
      return reply.code(err.statusCode || 500).send({ error: err.message })
    }
  })

  fastify.post('/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Invalidate a refresh token',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string }
    const tokenRecord = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, select: { userId: true } })
    await logoutService(refreshToken)
    try {
      await logAudit({ action: 'USER_LOGOUT', userId: tokenRecord?.userId, targetType: 'User', targetId: tokenRecord?.userId, details: { ip: request.ip } })
    } catch {}
    return reply.send({ message: 'Logged out successfully' })
  })

  fastify.get('/me', {
    schema: { tags: ['Auth'], summary: 'Get current user profile' },
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = await getMeService(request.currentUser.id)
      return reply.send(user)
    } catch (err: any) {
      return reply.code(err.statusCode || 500).send({ error: err.message })
    }
  })

  fastify.patch('/profile', {
    schema: {
      tags: ['Auth'],
      summary: 'Update own name, email, or password',
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 6 },
        },
      },
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const data = request.body as any
    try {
      const updated = await updateProfileService(request.currentUser.id, data)
      await logAudit({
        action: 'PROFILE_UPDATED',
        userId: request.currentUser.id,
        targetId: request.currentUser.id,
        targetType: 'User',
        ip: request.ip,
      })
      return reply.send(updated)
    } catch (err: any) {
      return reply.code(err.statusCode || 500).send({ error: err.message })
    }
  })

  // ── GET /api/auth/sessions — list active sessions ─────────────────────
  fastify.get('/sessions', {
    schema: { tags: ['Auth'], summary: 'List active sessions', security: [{ bearerAuth: [] }] },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const sessions = await prisma.refreshToken.findMany({
      where: { userId: request.currentUser.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, expiresAt: true, ip: true, userAgent: true },
    })
    return reply.send(sessions.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      ip: s.ip,
      userAgent: s.userAgent,
    })))
  })

  // ── DELETE /api/auth/sessions/:id — revoke a session ─────────────────
  fastify.delete('/sessions/:id', {
    schema: { tags: ['Auth'], summary: 'Revoke a session', security: [{ bearerAuth: [] }] },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const token = await prisma.refreshToken.findUnique({ where: { id } })
    if (!token) return reply.code(404).send({ error: 'Session not found' })
    if (token.userId !== request.currentUser.id) return reply.code(403).send({ error: 'Not your session' })
    await prisma.refreshToken.delete({ where: { id } })
    return reply.send({ message: 'Session revoked' })
  })

  // ── DELETE /api/auth/sessions — revoke all other sessions ─────────────
  fastify.delete('/sessions', {
    schema: { tags: ['Auth'], summary: 'Revoke all other sessions', security: [{ bearerAuth: [] }] },
    preHandler: [authenticate],
  }, async (request, reply) => {
    await prisma.refreshToken.deleteMany({
      where: { userId: request.currentUser.id },
    })
    return reply.send({ message: 'All sessions revoked' })
  })

  // ── POST /api/auth/sessions/revoke-by-ip — revoke sessions by IP ─────
  fastify.post('/sessions/revoke-by-ip', {
    schema: {
      tags: ['Auth'],
      summary: 'Revoke all sessions from a specific IP',
      body: { type: 'object', required: ['ip'], properties: { ip: { type: 'string' } } },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { ip } = request.body as { ip: string }
    const result = await prisma.refreshToken.deleteMany({
      where: { userId: request.currentUser.id, ip },
    })
    return reply.send({ message: `${result.count} session(s) révoquée(s) pour l'IP ${ip}` })
  })

  // ── POST /api/auth/sessions/revoke-old — revoke old sessions ──────────
  fastify.post('/sessions/revoke-old', {
    schema: {
      tags: ['Auth'],
      summary: 'Revoke sessions older than N days',
      body: { type: 'object', required: ['days'], properties: { days: { type: 'integer', default: 30 } } },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { days } = request.body as { days: number }
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const result = await prisma.refreshToken.deleteMany({
      where: { userId: request.currentUser.id, createdAt: { lt: cutoff } },
    })
    return reply.send({ message: `${result.count} session(s) ancienne(s) révoquée(s)` })
  })

  // ── POST /api/auth/impersonate — impersonate a user (admin only) ─────
  fastify.post('/impersonate', {
    schema: {
      tags: ['Auth'],
      summary: 'Impersonate a user (admin only)',
      body: {
        type: 'object',
        required: ['userId'],
        properties: { userId: { type: 'string' } },
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    // Only users with manage_permissions (Admin) can impersonate
    const hasPermission = request.currentUser.role?.permissions?.some(
      (rp) => rp.permission.name === 'manage_permissions',
    )
    if (!hasPermission) {
      return reply.code(403).send({ error: 'Only admins can impersonate users' })
    }

    const { userId } = request.body as { userId: string }
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      ...userWithRole,
    })

    if (!targetUser) return reply.code(404).send({ error: 'User not found' })
    if (targetUser.status !== 'ACTIVE') return reply.code(400).send({ error: 'Cannot impersonate inactive user' })

    // Generate tokens for the target user
    const accessToken = fastify.jwt.sign({ id: targetUser.id, email: targetUser.email })
    const refreshToken = crypto.randomBytes(64).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: targetUser.id, expiresAt, ip: request.ip },
    })

    // Log the impersonation
    await logAudit({
      action: 'USER_IMPERSONATED',
      userId: request.currentUser.id,
      targetId: targetUser.id,
      targetType: 'User',
      details: { adminName: request.currentUser.name, targetName: targetUser.name },
      ip: request.ip,
    })
    await notifyAdmins({
      title: 'Impersonation utilisateur',
      message: `L'administrateur ${request.currentUser.name} impersonne ${targetUser.name}.`,
      type: 'warning',
      excludeUserId: request.currentUser.id,
    })

    const { password: _, ...safeUser } = targetUser
    return reply.send({
      accessToken,
      refreshToken,
      user: safeUser,
      impersonator: request.currentUser.id,
    })
  })

  // ── POST /api/auth/stop-impersonate — stop impersonation ─────────────
  fastify.post('/stop-impersonate', {
    schema: {
      tags: ['Auth'],
      summary: 'Stop impersonation and return to admin session',
      body: {
        type: 'object',
        required: ['adminToken'],
        properties: { adminToken: { type: 'string' } },
      },
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { adminToken } = request.body as { adminToken: string }
    // Verify the admin token is valid
    try {
      const decoded = fastify.jwt.verify<{ id: string; email: string }>(adminToken)
      const admin = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { role: true },
      })
      if (!admin || admin.role?.name !== 'Admin') {
        return reply.code(403).send({ error: 'Invalid admin token' })
      }
      return reply.send({
        accessToken: adminToken,
        user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
      })
    } catch {
      return reply.code(401).send({ error: 'Invalid admin token' })
    }
  })
}
