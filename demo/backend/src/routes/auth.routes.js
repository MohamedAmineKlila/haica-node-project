const authSchema = require('../schemas/auth.schema')

async function authRoutes(fastify) {

  // POST /api/auth/login
  fastify.post('/login', { schema: authSchema.loginSchema }, async (request, reply) => {
    const { email, password } = request.body
    const result = await fastify.login(email, password)
    if (result.error) {
      console.log('Login error:', result.error)
      return reply.code(401).send({ error: result.error })
    }
    return reply.send(result)
  })

  // POST /api/auth/logout
  fastify.post('/logout', async (request, reply) => {
    const sessionId = request.headers['x-session-id']
    if (sessionId) fastify.logout(sessionId)
    return reply.send({ message: 'Deconnexion reussie' })
  })

  // GET /api/auth/me
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    return reply.send({ user: request.session })
  })
}

module.exports = { authRoutes }
