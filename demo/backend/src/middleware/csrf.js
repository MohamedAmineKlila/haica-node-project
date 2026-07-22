async function validateCsrf(request, reply) {
  const sessionId = request.cookies?.session_id || request.headers['x-session-id']
  const csrfToken = request.headers['x-csrf-token']

  if (!sessionId) {
    return reply.code(403).send({ error: 'Session ID manquant', message: 'X-Session-Id header requis' })
  }

  if (!csrfToken) {
    return reply.code(403).send({ error: 'Token CSRF manquant', message: 'X-Csrf-Token header requis' })
  }

  const valid = request.server.validateCsrfToken(sessionId, csrfToken)
  if (!valid) {
    return reply.code(403).send({ error: 'Token CSRF invalide ou expiré' })
  }
}

module.exports = { validateCsrf }
