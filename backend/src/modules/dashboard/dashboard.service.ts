import { prisma } from '../../plugins/prisma'

export async function getDashboardStats(from?: string, to?: string) {
  const dateFilter: any = {}
  if (from || to) {
    dateFilter.createdAt = {}
    if (from) dateFilter.createdAt.gte = new Date(from)
    if (to) dateFilter.createdAt.lte = new Date(to)
  }

  const [totalUsers, activeUsers, suspendedUsers, bannedUsers, totalRoles, totalAuditLogs] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({ where: { status: 'BANNED' } }),
      prisma.role.count(),
      prisma.auditLog.count({ where: dateFilter }),
    ])

  // Users grouped by role
  const usersByRole = await prisma.role.findMany({
    select: { name: true, _count: { select: { users: true } } },
  })

  // Recent audit logs (last 10)
  const recentActivity = await prisma.auditLog.findMany({
    where: dateFilter,
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  })

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    bannedUsers,
    totalRoles,
    totalAuditLogs,
    usersByRole: usersByRole.map((r) => ({ name: r.name, count: r._count.users })),
    recentActivity,
  }
}

export async function getActivityHeatmap(userId?: string) {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const where: any = { createdAt: { gte: oneYearAgo } }
  if (userId) where.userId = userId

  const logs = await prisma.auditLog.findMany({
    where,
    select: { createdAt: true },
  })

  const heatmapData: Record<string, number> = {}
  logs.forEach((log) => {
    const date = log.createdAt.toISOString().split('T')[0]
    heatmapData[date] = (heatmapData[date] || 0) + 1
  })

  return heatmapData
}
