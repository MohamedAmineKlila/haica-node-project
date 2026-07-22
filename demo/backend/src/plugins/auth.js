const bcrypt = require('bcryptjs')
const { executeQuery } = require('../queries/db.helpers')

const sessions = new Map()

async function authPlugin(fastify) {
  // Login
  fastify.decorate('login', async (email, password) => {
    const [rows] = await executeQuery(
      'SELECT u.id, u.name, u.email, u.password, u.status, u.role_id, r.name AS role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
      [email]
    )
    const user = rows[0]
    if (!user) return { error: 'Email ou mot de passe incorrect' }
    if (user.status !== 'ACTIVE') return { error: 'Compte desactive' }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return { error: 'Email ou mot de passe incorrect' }

    // Get permissions
    const [perms] = await executeQuery(
      'SELECT p.name FROM permissions p INNER JOIN role_permissions rp ON p.id = rp.permission_id WHERE rp.role_id = ?',
      [user.role_id]
    )
    user.permissions = perms.map(p => p.name)

    // Create session
    const sessionId = require('crypto').randomBytes(32).toString('hex')
    sessions.set(sessionId, {
      userId: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
      permissions: user.permissions,
      createdAt: Date.now()
    })

    const csrfToken = fastify.generateCsrfToken(sessionId)

    delete user.password
    return { user, sessionId, csrfToken }
  })

  // Logout
  fastify.decorate('logout', (sessionId) => {
    sessions.delete(sessionId)
  })

  // Get session
  fastify.decorate('getSession', (sessionId) => {
    return sessions.get(sessionId) || null
  })

  // Auth middleware
  fastify.decorate('authenticate', async (request, reply) => {
    const sessionId = request.headers['x-session-id']
    if (!sessionId) {
      return reply.code(401).send({ error: 'Non autorise', message: 'X-Session-Id requis' })
    }
    const session = sessions.get(sessionId)
    if (!session) {
      return reply.code(401).send({ error: 'Session expiree', message: 'Connectez-vous a nouveau' })
    }
    request.session = session
  })

  // Permission middleware factory
  fastify.decorate('requirePermission', (permission) => {
    return async (request, reply) => {
      if (!request.session) {
        return reply.code(401).send({ error: 'Non autorise' })
      }
      if (!request.session.permissions.includes(permission)) {
        return reply.code(403).send({
          error: 'Acces refuse',
          message: `Permission requise: ${permission}`,
          required: permission,
          your_permissions: request.session.permissions
        })
      }
    }
  })
}

module.exports = authPlugin
