const permissionService = require('../services/permission.service')
const {
  createPermissionSchema,
  updatePermissionSchema,
  getPermissionSchema,
  deletePermissionSchema,
} = require('../schemas/permission.schema')
const { validateCsrf } = require('../middleware/csrf')

async function permissionRoutes(fastify) {

  fastify.get('/', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const { data, error } = await permissionService.getAllPermissions()
    if (error) throw error
    return reply.send({ data, total: data.length })
  })

  fastify.get('/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('permissions.view')],
    ...getPermissionSchema
  }, async (request, reply) => {
    const { id } = request.params
    const { data: permission, error } = await permissionService.getPermissionById(id)
    if (error) throw error
    if (!permission) return reply.code(404).send({ error: 'Permission non trouvee' })
    return reply.send(permission)
  })

  fastify.post('/', {
    preHandler: [fastify.authenticate, fastify.requirePermission('permissions.manage'), validateCsrf],
    ...createPermissionSchema
  }, async (request, reply) => {
    const { name, description } = request.body
    const { data: existing } = await permissionService.getPermissionByName(name)
    if (existing) return reply.code(409).send({ error: 'Cette permission existe deja' })
    const { data: insertId, error } = await permissionService.createPermission({ name, description })
    if (error) throw error
    const { data: permission } = await permissionService.getPermissionById(insertId)
    return reply.code(201).send(permission)
  })

  fastify.patch('/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('permissions.manage'), validateCsrf],
    ...updatePermissionSchema
  }, async (request, reply) => {
    const { id } = request.params
    const { name, description } = request.body
    const { data: permission } = await permissionService.getPermissionById(id)
    if (!permission) return reply.code(404).send({ error: 'Permission non trouvee' })
    if (name && name !== permission.name) {
      const { data: nameTaken } = await permissionService.getPermissionByName(name)
      if (nameTaken) return reply.code(409).send({ error: 'Ce nom de permission est deja utilise' })
    }
    const updateData = {}
    if (name)        updateData.name = name
    if (description !== undefined) updateData.description = description
    const { error } = await permissionService.updatePermission(id, updateData)
    if (error) throw error
    const { data: updated } = await permissionService.getPermissionById(id)
    return reply.send(updated)
  })

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('permissions.manage'), validateCsrf],
    ...deletePermissionSchema
  }, async (request, reply) => {
    const { id } = request.params
    const { data: permission } = await permissionService.getPermissionById(id)
    if (!permission) return reply.code(404).send({ error: 'Permission non trouvee' })
    const { error } = await permissionService.deletePermission(id)
    if (error) throw error
    return reply.send({ message: 'Permission supprimee' })
  })
}

module.exports = { permissionRoutes }
