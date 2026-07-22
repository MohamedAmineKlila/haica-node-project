const bcrypt = require('bcryptjs')
const userService = require('../services/user.service')
const { createUserSchema, updateUserSchema, getUserSchema, deleteUserSchema } = require('../schemas/user.schema')
const { validateCsrf } = require('../middleware/csrf')

async function userRoutes(fastify) {

  fastify.get('/', {
    preHandler: [fastify.authenticate, fastify.requirePermission('users.view')]
  }, async (request, reply) => {
    const { data, error } = await userService.getAllUsers()
    if (error) throw error
    return reply.send({ data, total: data.length })
  })

  fastify.get('/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('users.view')],
    ...getUserSchema
  }, async (request, reply) => {
    const { id } = request.params
    const { data: user, error } = await userService.getUserById(id)
    if (error) throw error
    if (!user) return reply.code(404).send({ error: 'Utilisateur non trouve' })
    return reply.send(user)
  })

  fastify.post('/', {
    preHandler: [fastify.authenticate, fastify.requirePermission('users.create'), validateCsrf],
    ...createUserSchema
  }, async (request, reply) => {
    const { name, email, password, role_id } = request.body
    const { data: existing } = await userService.getUserByEmail(email)
    if (existing) return reply.code(409).send({ error: 'Cet email existe deja' })
    const hashedPassword = await bcrypt.hash(password, 10)
    const { data: insertId, error } = await userService.createUser({ name, email, password: hashedPassword, role_id })
    if (error) throw error
    const { data: user } = await userService.getUserById(insertId)
    return reply.code(201).send(user)
  })

  fastify.patch('/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('users.edit'), validateCsrf],
    ...updateUserSchema
  }, async (request, reply) => {
    const { id } = request.params
    const { name, email, status, role_id } = request.body

    if (Number(id) === 1) {
      return reply.code(403).send({ error: 'Le compte administrateur ne peut pas etre modifie' })
    }

    const { data: user } = await userService.getUserById(id)
    if (!user) return reply.code(404).send({ error: 'Utilisateur non trouve' })
    if (email && email !== user.email) {
      const { data: emailTaken } = await userService.getUserByEmail(email)
      if (emailTaken) return reply.code(409).send({ error: 'Cet email est deja utilise' })
    }
    const updateData = {}
    if (name)     updateData.name = name
    if (email)    updateData.email = email
    if (status)   updateData.status = status
    if (role_id !== undefined) updateData.role_id = role_id
    const { error } = await userService.updateUser(id, updateData)
    if (error) throw error
    const { data: updated } = await userService.getUserById(id)
    return reply.send(updated)
  })

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate, fastify.requirePermission('users.delete'), validateCsrf],
    ...deleteUserSchema
  }, async (request, reply) => {
    const { id } = request.params

    if (Number(id) === 1) {
      return reply.code(403).send({ error: 'Le compte administrateur ne peut pas etre supprime' })
    }

    const { data: user } = await userService.getUserById(id)
    if (!user) return reply.code(404).send({ error: 'Utilisateur non trouve' })
    const { error } = await userService.deleteUser(id)
    if (error) throw error
    return reply.send({ message: 'Utilisateur supprime' })
  })
}

module.exports = { userRoutes }
