const roleService = require('../services/role.service')
const {
  createRoleSchema,
  updateRoleSchema,
  getRoleSchema,
  deleteRoleSchema,
  syncPermissionsSchema,
} = require('../schemas/role.schema')
const { validateCsrf } = require('../middleware/csrf')

async function roleRoutes(fastify) {

  fastify.get('/groupes', {
    preHandler: [fastify.authenticate, fastify.requirePermission('roles.view')]
  }, async (request, reply) => {
    const { data, error } = await roleService.getAllGroupes()
    if (error) throw error
    return reply.send({ data, total: data.length })
  })

  fastify.get('/', {
    preHandler: [fastify.authenticate, fastify.requirePermission('roles.view')]
  }, async (request, reply) => {
    const { data, error } = await roleService.getAllRoles()
    if (error) throw error
    return reply.send({ data, total: data.length })
  })

  fastify.get('/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('roles.view')],
    ...getRoleSchema
  }, async (request, reply) => {
    const { id } = request.params
    const { data: role, error } = await roleService.getRoleById(id)
    if (error) throw error
    if (!role) return reply.code(404).send({ error: 'Role non trouve' })
    return reply.send(role)
  })

  fastify.get('/:id/permissions', {
    preHandler: [fastify.authenticate, fastify.requirePermission('roles.view')],
    ...getRoleSchema
  }, async (request, reply) => {
    const { id } = request.params
    const { data: role } = await roleService.getRoleById(id)
    if (!role) return reply.code(404).send({ error: 'Role non trouve' })
    const { data: permissions, error } = await roleService.getRolePermissions(id)
    if (error) throw error
    return reply.send({ data: permissions, total: permissions.length })
  })

  fastify.post('/', {
    preHandler: [fastify.authenticate, fastify.requirePermission('roles.create'), validateCsrf],
    ...createRoleSchema
  }, async (request, reply) => {
    const { name, description } = request.body
    const { data: existing } = await roleService.getRoleByName(name)
    if (existing) return reply.code(409).send({ error: 'Ce nom de role existe deja' })
    const { data: insertId, error } = await roleService.createRole({ name, description })
    if (error) throw error
    const { data: role } = await roleService.getRoleById(insertId)
    return reply.code(201).send(role)
  })

  fastify.patch('/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('roles.edit'), validateCsrf],
    ...updateRoleSchema
  }, async (request, reply) => {
    const { id } = request.params
    const { name, description } = request.body
    const { data: role } = await roleService.getRoleById(id)
    if (!role) return reply.code(404).send({ error: 'Role non trouve' })
    if (name && name !== role.name) {
      const { data: nameTaken } = await roleService.getRoleByName(name)
      if (nameTaken) return reply.code(409).send({ error: 'Ce nom de role est deja utilise' })
    }
    const updateData = {}
    if (name)        updateData.name = name
    if (description !== undefined) updateData.description = description
    const { error } = await roleService.updateRole(id, updateData)
    if (error) throw error
    const { data: updated } = await roleService.getRoleById(id)
    return reply.send(updated)
  })

  fastify.put('/:id/permissions', {
    preHandler: [fastify.authenticate, fastify.requirePermission('roles.edit'), validateCsrf],
    ...syncPermissionsSchema
  }, async (request, reply) => {
    const { id } = request.params
    const { permissionIds } = request.body
    const { data: role } = await roleService.getRoleById(id)
    if (!role) return reply.code(404).send({ error: 'Role non trouve' })
    const { error } = await roleService.syncRolePermissions(id, permissionIds)
    if (error) throw error
    const { data: permissions } = await roleService.getRolePermissions(id)
    return reply.send({ message: 'Permissions mises a jour', data: permissions })
  })

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('roles.delete'), validateCsrf],
    ...deleteRoleSchema
  }, async (request, reply) => {
    const { id } = request.params
    const { data: role } = await roleService.getRoleById(id)
    if (!role) return reply.code(404).send({ error: 'Role non trouve' })
    const { error } = await roleService.deleteRole(id)
    if (error) throw error
    return reply.send({ message: 'Role supprime' })
  })
}

module.exports = { roleRoutes }
