import { FastifyInstance } from 'fastify'
import { registerRoute } from '../../utils/routeHelpers'
import { getWeeklyReport } from './reports.service'

const TAG = ['Reports']

export async function reportsRoutes(fastify: FastifyInstance) {
  registerRoute(fastify, 'GET', '/weekly', TAG, 'view_reports', 'Generate weekly admin report', null, async (req, reply) => {
    return reply.send(await getWeeklyReport())
  })
}
