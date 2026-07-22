import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../plugins/prisma'
import { authenticate } from '../../middleware/authenticate'
import { registerRoute, auditAndNotify } from '../../utils/routeHelpers'
import { handleAvatarUpload } from '../../utils/avatar'
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateAvatar,
  deleteAvatar,
  restoreUser,
  bulkCreateUsers,
  bulkAssignRole,
} from './users.service'

const TAG = ['Users']

const BODY_CREATE = {
  type: 'object',
  required: ['name', 'email', 'password'],
  properties: {
    name:     { type: 'string' },
    email:    { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
    roleId:   { type: 'string' },
  },
}

const BODY_UPDATE = {
  type: 'object',
  properties: {
    name:     { type: 'string' },
    email:    { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
    roleId:   { type: ['string', 'null'] },
    status:   { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] },
  },
}

const BODY_BULK = {
  type: 'object',
  required: ['users'],
  properties: {
    users: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name:     { type: 'string' },
          email:    { type: 'string' },
          password: { type: 'string' },
          roleId:   { type: 'string' },
        },
      },
    },
  },
}

const QUERY_PAGINATED = {
  type: 'object',
  properties: {
    page:   { type: 'integer', default: 1 },
    limit:  { type: 'integer', default: 10 },
    search: { type: 'string' },
    roleId: { type: 'string' },
    status: { type: 'string' },
  },
}

const BODY_BULK_ROLE = {
  type: 'object',
  required: ['userIds', 'roleId'],
  properties: {
    userIds: { type: 'array', items: { type: 'string' } },
    roleId:  { type: 'string' },
  },
}

export async function usersRoutes(fastify: FastifyInstance) {
  // ── GET /api/users ──────────────────────────────────────────────
  registerRoute(fastify, 'GET', '/', TAG, 'view_users', 'List users', QUERY_PAGINATED, async (req, reply) => {
    const q = req.query as any
    return reply.send(await getUsers({
      page: Number(q.page) || 1, limit: Number(q.limit) || 10,
      search: q.search, roleId: q.roleId, status: q.status,
    }))
  })

  // ── GET /api/users/:id ──────────────────────────────────────────
  registerRoute(fastify, 'GET', '/:id', TAG, 'view_users', 'Get user', null, async (req, reply) => {
    const { id } = req.params as { id: string }
    return reply.send(await getUserById(id))
  })

  // ── POST /api/users ─────────────────────────────────────────────
  registerRoute(fastify, 'POST', '/', TAG, 'create_user', 'Create user', BODY_CREATE, async (req, reply) => {
    const user = await createUser(req.body as any)
    await auditAndNotify(req, {
      action: 'USER_CREATED', targetId: user.id, targetType: 'User',
      details: { name: user.name, email: user.email },
    }, {
      title: 'Nouvel utilisateur',
      message: `${user.name} (${user.email}) a été créé.`,
      type: 'info', link: '/admin/users',
    })
    return reply.code(201).send(user)
  })

  // ── POST /api/users/bulk-import ─────────────────────────────────
  registerRoute(fastify, 'POST', '/bulk-import', TAG, 'create_user', 'Bulk import users', BODY_BULK, async (req, reply) => {
    const { users } = req.body as any
    const result = await bulkCreateUsers(users)
    await auditAndNotify(req, {
      action: 'USERS_BULK_IMPORTED', targetType: 'User',
      details: { count: result.created, failed: result.failed },
    })
    return reply.send(result)
  })

  // ── POST /api/users/bulk-role ───────────────────────────────────
  registerRoute(fastify, 'POST', '/bulk-role', TAG, 'edit_user', 'Bulk assign role', BODY_BULK_ROLE, async (req, reply) => {
    const { userIds, roleId } = req.body as { userIds: string[]; roleId: string }
    const result = await bulkAssignRole(userIds, roleId)
    await auditAndNotify(req, {
      action: 'USERS_BULK_ROLE_ASSIGNED', targetType: 'User',
      details: { userIds, roleId, count: result.updated },
    })
    return reply.send(result)
  })

  // ── PATCH /api/users/:id ────────────────────────────────────────
  registerRoute(fastify, 'PATCH', '/:id', TAG, 'edit_user', 'Update user', BODY_UPDATE, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = req.body as any
    if (body.status || body.roleId !== undefined) {
      const target = await prisma.user.findUnique({ where: { id }, include: { role: true } })
      if (target?.role?.name === 'Admin') {
        return reply.code(403).send({ error: 'Cannot modify role or status of an Admin user' })
      }
    }
    const user = await updateUser(id, body)
    await auditAndNotify(req, {
      action: 'USER_UPDATED', targetId: id, targetType: 'User', details: body,
    })
    if (body.status) {
      const labels: Record<string, string> = { ACTIVE: 'activé', SUSPENDED: 'suspendu', BANNED: 'banni' }
      await auditAndNotify(req, {
        action: 'USER_STATUS_CHANGED', targetId: id, targetType: 'User',
      }, {
        title: 'Statut utilisateur modifié',
        message: `Le compte de ${user.name} (${user.email}) a été ${labels[body.status] ?? body.status}.`,
        type: body.status === 'ACTIVE' ? 'success' : 'error',
        link: '/admin/users',
      })
    }
    return reply.send(user)
  })

  // ── DELETE /api/users/:id ───────────────────────────────────────
  registerRoute(fastify, 'DELETE', '/:id', TAG, 'delete_user', 'Delete user', null, async (req, reply) => {
    const { id } = req.params as { id: string }
    if (id === req.currentUser.id) {
      return reply.code(400).send({ error: 'You cannot delete your own account' })
    }
    const target = await prisma.user.findUnique({ where: { id }, include: { role: true } })
    if (target?.role?.name === 'Admin') {
      return reply.code(403).send({ error: 'Cannot delete an Admin user' })
    }
    await deleteUser(id)
    await auditAndNotify(req, {
      action: 'USER_DELETED', targetId: id, targetType: 'User',
    })
    return reply.send({ message: 'User deleted' })
  })

  // ── PATCH /api/users/:id/restore ────────────────────────────────
  registerRoute(fastify, 'PATCH', '/:id/restore', TAG, 'manage_user_status', 'Restore user', null, async (req, reply) => {
    const { id } = req.params as { id: string }
    const user = await restoreUser(id)
    await auditAndNotify(req, {
      action: 'USER_RESTORED', targetId: id, targetType: 'User',
    })
    return reply.send(user)
  })

  // ── PATCH /api/users/:id/avatar ─────────────────────────────────
  registerRoute(fastify, 'PATCH', '/:id/avatar', TAG, 'edit_user', 'Upload avatar for user', null, async (req, reply) => {
    const { id } = req.params as { id: string }
    const avatarUrl = await handleAvatarUpload(id, req)
    return reply.send({ avatar: `http://localhost:3000${avatarUrl}` })
  })

  // ── PATCH /api/users/me/avatar ──────────────────────────────────
  fastify.patch('/me/avatar', {
    schema: { tags: TAG, summary: 'Upload own avatar', security: [{ bearerAuth: [] }] },
    preHandler: [authenticate],
  }, async (req, reply) => {
    try {
      const avatarUrl = await handleAvatarUpload(req.currentUser.id, req)
      return reply.send({ avatar: `http://localhost:3000${avatarUrl}` })
    } catch (err: any) {
      return reply.code(err.statusCode || 500).send({ error: err.message || 'Upload failed' })
    }
  })

  // ── DELETE /api/users/me/avatar ─────────────────────────────────
  fastify.delete('/me/avatar', {
    schema: { tags: TAG, summary: 'Delete own avatar', security: [{ bearerAuth: [] }] },
    preHandler: [authenticate],
  }, async (req, reply) => {
    try {
      await deleteAvatar(req.currentUser.id)
      return reply.send({ avatar: null })
    } catch (err: any) {
      return reply.code(500).send({ error: err.message || 'Delete failed' })
    }
  })
}
