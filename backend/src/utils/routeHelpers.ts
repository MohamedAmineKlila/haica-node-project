import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authenticate } from '../middleware/authenticate'
import { checkPermission } from '../middleware/checkPermission'
import { logAudit } from '../utils/auditLogger'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'

type Handler = (request: FastifyRequest, reply: FastifyReply) => Promise<any>

interface AuditLogData {
  action: string
  targetType?: string
  details?: any
  targetId?: string
}

const SEC = [{ bearerAuth: [] }]

// ── Core: register a route with full control ───────────────────────────
export function registerRoute(
  fastify: FastifyInstance,
  method: HttpMethod,
  path: string,
  tags: string[],
  permission: string,
  summary: string,
  bodyOrQuery: Record<string, any> | null,
  handler: Handler,
) {
  const schema: any = { tags, summary, security: SEC }
  if (method === 'GET' || method === 'DELETE') {
    if (bodyOrQuery) schema.querystring = bodyOrQuery
  } else {
    if (bodyOrQuery) schema.body = bodyOrQuery
  }

  const preHandler: any[] = [authenticate]
  if (permission) preHandler.push(checkPermission(permission))

  fastify[method.toLowerCase() as 'get' | 'post' | 'patch' | 'delete'](
    path,
    { schema, preHandler },
    async (request, reply) => {
      try {
        return await handler(request, reply)
      } catch (err: any) {
        return reply.code(err.statusCode || 500).send({ error: err.message })
      }
    },
  )
}

// ── Audit + notify helper ──────────────────────────────────────────────
export async function auditAndNotify(
  request: FastifyRequest,
  data: AuditLogData,
  notification?: { title: string; message: string; type?: string; link?: string },
) {
  await logAudit({
    action: data.action,
    userId: request.currentUser?.id,
    targetId: data.targetId,
    targetType: data.targetType,
    details: data.details,
    ip: request.ip,
  })
  if (notification) {
    const { notifyAdmins } = await import('../modules/notifications/notification.service')
    await notifyAdmins(notification)
  }
}
