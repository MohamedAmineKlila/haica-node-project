import { FastifyInstance } from 'fastify'
import { registerRoute, auditAndNotify } from '../../utils/routeHelpers'
import { getPermissions, createPermission, deletePermission, updatePermission } from './permissions.service'

const TAG = ['Permissions']

const BODY_CREATE = {
  type: 'object',
  required: ['name'],
  properties: {
    name:        { type: 'string' },
    description: { type: 'string' },
    category:    { type: 'string' },
  },
}

const BODY_UPDATE = {
  type: 'object',
  properties: {
    name:        { type: 'string' },
    description: { type: 'string' },
    category:    { type: 'string' },
  },
}

export async function permissionsRoutes(fastify: FastifyInstance) {
  // ── GET /api/permissions ────────────────────────────────────────
  registerRoute(fastify, 'GET', '/', TAG, 'view_permissions', 'List permissions', null, async (req, reply) => {
    return reply.send(await getPermissions())
  })

  // ── POST /api/permissions ───────────────────────────────────────
  registerRoute(fastify, 'POST', '/', TAG, 'manage_permissions', 'Create permission', BODY_CREATE, async (req, reply) => {
    const perm = await createPermission({ ...(req.body as any), createdBy: req.currentUser.id })
    await auditAndNotify(req, {
      action: 'PERMISSION_CREATED', targetId: perm.id, targetType: 'Permission',
      details: { name: perm.name },
    }, {
      title: 'Nouvelle permission',
      message: `La permission "${perm.name}" a été créée.`,
      type: 'info', link: '/admin/permissions',
    })
    return reply.code(201).send(perm)
  })

  // ── PATCH /api/permissions/:id ──────────────────────────────────
  registerRoute(fastify, 'PATCH', '/:id', TAG, 'manage_permissions', 'Update permission', BODY_UPDATE, async (req, reply) => {
    const { id } = req.params as { id: string }
    const perm = await updatePermission(id, { ...(req.body as any), updatedBy: req.currentUser.id })
    await auditAndNotify(req, {
      action: 'PERMISSION_UPDATED', targetId: id, targetType: 'Permission', details: req.body,
    }, {
      title: 'Permission modifiée',
      message: `La permission "${perm.name}" a été modifiée.`,
      type: 'info', link: '/admin/permissions',
    })
    return reply.send(perm)
  })

  // ── DELETE /api/permissions/:id ─────────────────────────────────
  registerRoute(fastify, 'DELETE', '/:id', TAG, 'manage_permissions', 'Delete permission', null, async (req, reply) => {
    const { id } = req.params as { id: string }
    await deletePermission(id)
    await auditAndNotify(req, {
      action: 'PERMISSION_DELETED', targetId: id, targetType: 'Permission',
    }, {
      title: 'Permission supprimée',
      message: `Une permission a été supprimée.`,
      type: 'error', link: '/admin/permissions',
    })
    return reply.send({ message: 'Permission deleted' })
  })
}
