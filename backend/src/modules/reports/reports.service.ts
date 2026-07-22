import { prisma } from '../../plugins/prisma'

export async function getWeeklyReport() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    activeUsers,
    newUsersThisWeek,
    usersByStatus,
    usersByRole,
    recentAuditLogs,
    loginsThisWeek,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.groupBy({ by: ['status'], _count: true }),
    prisma.user.groupBy({ by: ['roleId'], _count: true, where: { status: 'ACTIVE' } }),
    prisma.auditLog.findMany({
      where: { createdAt: { gte: weekAgo } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { name: true } } },
    }),
    prisma.auditLog.count({ where: { action: 'USER_LOGIN', createdAt: { gte: weekAgo } } }),
  ])

  const roles = await prisma.role.findMany({ select: { id: true, name: true } })
  const roleMap = Object.fromEntries(roles.map(r => [r.id, r.name]))

  return {
    period: { from: weekAgo.toISOString(), to: now.toISOString() },
    summary: {
      totalUsers,
      activeUsers,
      newUsersThisWeek,
      loginsThisWeek,
    },
    usersByStatus: usersByStatus.map(s => ({ status: s.status, count: s._count })),
    usersByRole: usersByRole.map(r => ({ role: roleMap[r.roleId!] ?? 'Sans rôle', count: r._count })),
    recentActivity: recentAuditLogs.map(log => ({
      id: log.id,
      action: log.action,
      user: log.user?.name ?? 'System',
      targetType: log.targetType,
      createdAt: log.createdAt,
    })),
  }
}
