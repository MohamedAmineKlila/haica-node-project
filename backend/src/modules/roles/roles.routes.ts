import { FastifyInstance } from 'fastify'
import { registerRoute, auditAndNotify } from '../../utils/routeHelpers'
import { getRoles, getRoleById, createRole, updateRole, deleteRole } from './roles.service'

const TAG = ['Roles']

const BODY_CREATE = {
  type: 'object',
  required: ['name'],
  properties: {
    name:          { type: 'string' },
    description:   { type: 'string' },
    permissionIds: { type: 'array', items: { type: 'string' } },
  },
}

const BODY_UPDATE = {
  type: 'object',
  properties: {
    name:          { type: 'string' },
    description:   { type: 'string' },
    permissionIds: { type: 'array', items: { type: 'string' } },
  },
}

export async function rolesRoutes(fastify: FastifyInstance) {
  // ── GET /api/roles ──────────────────────────────────────────────
  registerRoute(fastify, 'GET', '/', TAG, 'view_roles', 'List roles', null, async (req, reply) => {
    return reply.send(await getRoles())
  })

  // ── GET /api/roles/:id ──────────────────────────────────────────
  registerRoute(fastify, 'GET', '/:id', TAG, 'view_roles', 'Get role', null, async (req, reply) => {
    const { id } = req.params as { id: string }
    return reply.send(await getRoleById(id))
  })

  // ── POST /api/roles ─────────────────────────────────────────────
  registerRoute(fastify, 'POST', '/', TAG, 'create_role', 'Create role', BODY_CREATE, async (req, reply) => {
    const role = await createRole({ ...(req.body as any), createdBy: req.currentUser.id })
    await auditAndNotify(req, {
      action: 'ROLE_CREATED', targetId: role.id, targetType: 'Role',
      details: { name: role.name },
    }, {
      title: 'Nouveau rôle',
      message: `Le rôle "${role.name}" a été créé.`,
      type: 'info', link: '/admin/roles',
    })
    return reply.code(201).send(role)
  })

  // ── PATCH /api/roles/:id ────────────────────────────────────────
  registerRoute(fastify, 'PATCH', '/:id', TAG, 'edit_role', 'Update role', BODY_UPDATE, async (req, reply) => {
    const { id } = req.params as { id: string }
    const role = await updateRole(id, { ...(req.body as any), updatedBy: req.currentUser.id })
    await auditAndNotify(req, {
      action: 'ROLE_UPDATED', targetId: id, targetType: 'Role', details: req.body,
    }, {
      title: 'Rôle modifié',
      message: `Le rôle "${role.name}" a été modifié.`,
      type: 'info', link: '/admin/roles',
    })
    return reply.send(role)
  })

  // ── DELETE /api/roles/:id ───────────────────────────────────────
  registerRoute(fastify, 'DELETE', '/:id', TAG, 'delete_role', 'Delete role', null, async (req, reply) => {
    const { id } = req.params as { id: string }
    await deleteRole(id)
    await auditAndNotify(req, {
      action: 'ROLE_DELETED', targetId: id, targetType: 'Role',
    }, {
      title: 'Rôle supprimé',
      message: `Un rôle a été supprimé.`,
      type: 'error', link: '/admin/roles',
    })
    return reply.send({ message: 'Role deleted' })
  })
}
