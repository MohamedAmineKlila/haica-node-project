import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../plugins/prisma'
import { userWithRole, UserWithRole } from '../types'

// Augment Fastify's Request type so every route can access request.currentUser
declare module 'fastify' {
  interface FastifyRequest {
    currentUser: UserWithRole
  }
}

/**
 * authenticate — preHandler hook
 *
 * 1. Verifies the Bearer JWT in the Authorization header
 * 2. Loads the full user (with role + permissions) from the DB
 * 3. Rejects suspended / banned accounts
 * 4. Attaches the user to request.currentUser for downstream handlers
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // jwtVerify() reads Authorization: Bearer <token> and sets request.user
    await request.jwtVerify()
    const payload = request.user as { id: string; email: string }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      ...userWithRole,
    })

    if (!user) {
      return reply.code(401).send({ error: 'User not found' })
    }
    if (user.status !== 'ACTIVE') {
      return reply
        .code(403)
        .send({ error: `Account is ${user.status.toLowerCase()}` })
    }

    request.currentUser = user
  } catch {
    return reply.code(401).send({ error: 'Unauthorized: invalid or expired token' })
  }
}
