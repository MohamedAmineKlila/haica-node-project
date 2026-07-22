import { FastifyRequest, FastifyReply } from 'fastify'

/**
 * checkPermission — permission-based guard factory
 *
 * Usage in a route:
 *   preHandler: [authenticate, checkPermission('delete_user')]
 *
 * This checks the permission STRING (e.g. "delete_user") rather than a role ID,
 * making it easy to add new roles without changing route code.
 */
export function checkPermission(permission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.currentUser

    if (!user) {
      return reply.code(401).send({ error: 'Not authenticated' })
    }

    // Collect all permission names from the user's role
    const userPermissions =
      user.role?.permissions.map((rp) => rp.permission.name) ?? []

    if (!userPermissions.includes(permission)) {
      return reply.code(403).send({
        error: 'Forbidden',
        required: permission,
        message: `You need the '${permission}' permission to do this`,
      })
    }
  }
}
