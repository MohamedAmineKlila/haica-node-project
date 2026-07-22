import { prisma } from '../../plugins/prisma'

export async function getAuditLogs(params: {
  page: number
  limit: number
  search?: string
  action?: string
  targetId?: string
  targetType?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
}) {
  const { page, limit, search, action, targetId, targetType, userId, dateFrom, dateTo } = params
  const skip = (page - 1) * limit

  const where: any = {}
  if (search) {
    where.OR = [
      { action: { contains: search } },
      { targetType: { contains: search } },
    ]
  }
  if (action) where.action = action
  if (targetId) where.targetId = targetId
  if (targetType) where.targetType = targetType
  if (userId) where.userId = userId
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = new Date(dateFrom)
    if (dateTo) where.createdAt.lte = new Date(dateTo)
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ])

  return { data: logs, total, page, limit, totalPages: Math.ceil(total / limit) }
}
