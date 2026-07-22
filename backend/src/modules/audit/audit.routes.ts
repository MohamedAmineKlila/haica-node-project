import { FastifyInstance } from 'fastify'
import { registerRoute } from '../../utils/routeHelpers'
import { getAuditLogs } from './audit.service'

const TAG = ['Audit']

const QUERY_PAGINATED = {
  type: 'object',
  properties: {
    page:      { type: 'integer', default: 1 },
    limit:     { type: 'integer', default: 20 },
    search:    { type: 'string' },
    action:    { type: 'string' },
    targetId:  { type: 'string' },
    targetType: { type: 'string' },
    userId:    { type: 'string' },
    dateFrom:  { type: 'string' },
    dateTo:    { type: 'string' },
  },
}

export async function auditRoutes(fastify: FastifyInstance) {
  registerRoute(fastify, 'GET', '/', TAG, 'view_audit_logs', 'List audit logs', QUERY_PAGINATED, async (req, reply) => {
    const q = req.query as any
    return reply.send(
      await getAuditLogs({
        page: Number(q.page) || 1, limit: Number(q.limit) || 20,
        search: q.search, action: q.action, targetId: q.targetId, targetType: q.targetType,
        userId: q.userId, dateFrom: q.dateFrom, dateTo: q.dateTo,
      }),
    )
  })
}
