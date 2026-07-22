import { FastifyInstance } from 'fastify'
import { registerRoute } from '../../utils/routeHelpers'
import { getDashboardStats, getActivityHeatmap } from './dashboard.service'

const TAG = ['Dashboard']

const QUERY_STATS = {
  type: 'object',
  properties: {
    from: { type: 'string', format: 'date-time' },
    to:   { type: 'string', format: 'date-time' },
  },
}

export async function dashboardRoutes(fastify: FastifyInstance) {
  registerRoute(fastify, 'GET', '/stats', TAG, 'view_dashboard', 'Dashboard stats', QUERY_STATS, async (req, reply) => {
    const q = req.query as any
    return reply.send(await getDashboardStats(q.from, q.to))
  })

  registerRoute(fastify, 'GET', '/heatmap', TAG, 'view_dashboard', 'Activity heatmap', null, async (req, reply) => {
    return reply.send(await getActivityHeatmap())
  })
}
