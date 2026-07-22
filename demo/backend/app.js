require('dotenv').config()
const ajvErrors = require('ajv-errors')
const crypto = require('crypto')
const fastify = require('fastify')({
  logger: false,
  ajv: {
    customOptions: {
      allErrors: true,
      strict: false,
    },
    plugins: [[ajvErrors, { keepErrors: false }]],
  },
  schemaErrorFormatter: (errors, dataVar) => {
    const err = new Error(`Validation echouee sur [${dataVar}]`)
    err.validation = errors
    err.validationContext = dataVar
    return err
  },
})
const { connect } = require('./src/config/db.conf')
const csrfPlugin = require('./src/plugins/csrf')
const authPlugin = require('./src/plugins/auth')
const { userRoutes } = require('./src/routes/user.routes')
const { roleRoutes } = require('./src/routes/role.routes')
const { permissionRoutes } = require('./src/routes/permission.routes')
const { authRoutes } = require('./src/routes/auth.routes')

const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || '0.0.0.0'

async function main() {
  await connect()

  await fastify.register(require('@fastify/cors'), {
    origin: true,
    credentials: true,
  })

  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error)

    if (error.code === 'FST_ERR_VALIDATION' || error.validation) {
      const details = (error.validation || []).map(e => {
        const path = e.instancePath ? e.instancePath.replace(/^\//, '') : ''
        const field = path || e.params?.missingProperty || error.validationContext
        return { field, message: e.message }
      })
      return reply.code(400).send({
        error: error.message || `Validation echouee sur [${error.validationContext}]`,
        details,
      })
    }

    if (error.code === 'ER_DUP_ENTRY') {
      const match = error.message.match(/Duplicate entry '(.+)' for/)
      return reply.code(409).send({
        error: 'Cet enregistrement existe deja',
        details: match ? `Valeur en double: ${match[1]}` : undefined
      })
    }

    if (error.code === 'ER_NO_SUCH_TABLE') {
      return reply.code(500).send({
        error: 'Table manquante dans la base de donnees',
        details: error.message
      })
    }

    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return reply.code(500).send({
        error: 'Colonne inexistante dans la table',
        details: error.message
      })
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return reply.code(503).send({
        error: 'Base de donnees indisponible',
        details: 'La connexion a MySQL a echoue'
      })
    }

    const statusCode = error.statusCode || 500
    return reply.code(statusCode).send({
      error: error.message || 'Internal Server Error',
    })
  })

  await csrfPlugin(fastify)
  await authPlugin(fastify)
  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(userRoutes, { prefix: '/api/users' })
  await fastify.register(roleRoutes, { prefix: '/api/roles' })
  await fastify.register(permissionRoutes, { prefix: '/api/permissions' })

  fastify.get('/api/csrf-token', async (request, reply) => {
    const sessionId = request.headers['x-session-id'] || crypto.randomBytes(16).toString('hex')
    const token = fastify.generateCsrfToken(sessionId)
    return reply.send({ sessionId, csrfToken: token })
  })

  fastify.get('/api/stats', { preHandler: [fastify.authenticate, fastify.requirePermission('dashboard.view')] }, async (request, reply) => {
    const { executeQuery } = require('./src/queries/db.helpers')
    const [statsRows] = await executeQuery('SELECT * FROM v_stats')
    const [recentUsers] = await executeQuery('SELECT * FROM v_users ORDER BY created_at DESC LIMIT 5')
    const [recentRoles] = await executeQuery('SELECT * FROM v_roles ORDER BY created_at DESC LIMIT 5')
    return reply.send({ stats: statsRows[0], recentUsers, recentRoles })
  })

  fastify.get('/api/health-check', { preHandler: [fastify.authenticate, fastify.requirePermission('users.delete')] }, async (request, reply) => {
    const { executeQuery } = require('./src/queries/db.helpers')
    const [issues] = await executeQuery('SELECT * FROM v_health_check')
    return reply.send({ issues, total: issues.length })
  })

  fastify.get('/health', async () => ({ status: 'ok' }))

  fastify.post('/api/visitor-log', async (request, reply) => {
    const { consent, page, referrer } = request.body || {}

    if (!consent) {
      return reply.code(400).send({ error: 'Consent requis pour enregistrer les informations' })
    }

    const userAgent = request.headers['user-agent'] || ''
    const ip = request.headers['x-forwarded-for']
      ? request.headers['x-forwarded-for'].split(',')[0].trim()
      : request.socket.remoteAddress

    const deviceType = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent) ? 'mobile' : 'desktop'
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)\/?\s*([\d.]+)?/)
    const browser = browserMatch ? browserMatch[1] : 'Unknown'
    const osMatch = userAgent.match(/(Windows NT|Mac OS X|Android|iOS|Linux)\s*([\d._]+)?/)
    const os = osMatch ? osMatch[1].replace('Windows NT', 'Windows').replace('Mac OS X', 'macOS') : 'Unknown'

    const { executeQuery } = require('./src/queries/db.helpers')
    await executeQuery(
      `INSERT INTO visitor_logs (ip_address, user_agent, device_type, browser, os, referrer, page, consent_given)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [ip, userAgent, deviceType, browser, os, referrer || null, page || null]
    )

    return reply.send({ ok: true })
  })

  fastify.get('/api/visitor-logs', { preHandler: [fastify.authenticate, fastify.requirePermission('audit.view')] }, async (request, reply) => {
    const { executeQuery } = require('./src/queries/db.helpers')
    const [rows] = await executeQuery('SELECT * FROM visitor_logs ORDER BY created_at DESC LIMIT 200')
    return reply.send({ logs: rows })
  })

  const shutdown = async () => {
    await fastify.close()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  await fastify.listen({ port: PORT, host: HOST })
  console.log(`\n Server running at http://localhost:${PORT}\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
