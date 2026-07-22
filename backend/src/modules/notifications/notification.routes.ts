import { FastifyInstance } from 'fastify'
import { registerRoute } from '../../utils/routeHelpers'
import { prisma } from '../../plugins/prisma'

const TAG = ['Notifications']

export async function notificationRoutes(fastify: FastifyInstance) {
  // ── GET /api/notifications ──────────────────────────────────────
  registerRoute(fastify, 'GET', '/', TAG, '', 'List notifications', null, async (req, reply) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.currentUser.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return reply.send(notifications)
  })

  // ── GET /api/notifications/unread-count ─────────────────────────
  registerRoute(fastify, 'GET', '/unread-count', TAG, '', 'Unread count', null, async (req, reply) => {
    const count = await prisma.notification.count({
      where: { userId: req.currentUser.id, read: false },
    })
    return reply.send({ count })
  })

  // ── PATCH /api/notifications/:id/read ──────────────────────────
  registerRoute(fastify, 'PATCH', '/:id/read', TAG, '', 'Mark as read', null, async (req, reply) => {
    const { id } = req.params as { id: string }
    const n = await prisma.notification.findUnique({ where: { id } })
    if (!n || n.userId !== req.currentUser.id) {
      return reply.code(404).send({ error: 'Notification not found' })
    }
    await prisma.notification.update({ where: { id }, data: { read: true } })
    return reply.send({ message: 'Marked as read' })
  })

  // ── PATCH /api/notifications/read-all ──────────────────────────
  registerRoute(fastify, 'PATCH', '/read-all', TAG, '', 'Mark all as read', null, async (req, reply) => {
    await prisma.notification.updateMany({
      where: { userId: req.currentUser.id, read: false },
      data: { read: true },
    })
    return reply.send({ message: 'All notifications marked as read' })
  })

  // ── DELETE /api/notifications/:id ──────────────────────────────
  registerRoute(fastify, 'DELETE', '/:id', TAG, '', 'Delete notification', null, async (req, reply) => {
    const { id } = req.params as { id: string }
    const n = await prisma.notification.findUnique({ where: { id } })
    if (!n || n.userId !== req.currentUser.id) {
      return reply.code(404).send({ error: 'Notification not found' })
    }
    await prisma.notification.delete({ where: { id } })
    return reply.send({ message: 'Deleted' })
  })
}
