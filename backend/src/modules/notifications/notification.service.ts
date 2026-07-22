import { prisma } from '../../plugins/prisma'

export async function createNotification(data: {
  userId: string
  title: string
  message: string
  type?: string
  link?: string
}) {
  return prisma.notification.create({ data })
}

export async function notifyAdmins(data: {
  title: string
  message: string
  type?: string
  link?: string
  excludeUserId?: string
}) {
  const admins = await prisma.user.findMany({
    where: {
      role: { name: { in: ['Admin', 'HR'] } },
      status: 'ACTIVE',
      ...(data.excludeUserId ? { id: { not: data.excludeUserId } } : {}),
    },
    select: { id: true },
  })

  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link,
    })
  }
}
