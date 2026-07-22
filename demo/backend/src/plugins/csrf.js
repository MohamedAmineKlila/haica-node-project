const crypto = require('crypto')

const tokens = new Map()

async function csrfPlugin(fastify) {
  fastify.decorate('generateCsrfToken', (sessionId) => {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = Date.now() + 60 * 60 * 1000
    tokens.set(sessionId, { token, expiresAt })
    return token
  })

  fastify.decorate('validateCsrfToken', (sessionId, token) => {
    const stored = tokens.get(sessionId)
    if (!stored) return false
    if (stored.expiresAt < Date.now()) {
      tokens.delete(sessionId)
      return false
    }
    return stored.token === token
  })

  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of tokens.entries()) {
      if (value.expiresAt < now) tokens.delete(key)
    }
  }, 10 * 60 * 1000)
}

module.exports = csrfPlugin
