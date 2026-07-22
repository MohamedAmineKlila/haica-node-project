import { prisma } from '../../plugins/prisma'

export async function getPermissions() {
  return prisma.permission.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] })
}

export async function createPermission(data: {
  name: string
  description?: string
  category?: string
  createdBy?: string
}) {
  const existing = await prisma.permission.findUnique({ where: { name: data.name } })
  if (existing) throw { statusCode: 409, message: 'Permission already exists' }
  return prisma.permission.create({ data })
}

export async function deletePermission(id: string) {
  const existing = await prisma.permission.findUnique({ where: { id } })
  if (!existing) throw { statusCode: 404, message: 'Permission not found' }
  await prisma.permission.delete({ where: { id } })
}

export async function updatePermission(id: string, data: {
  name?: string
  description?: string
  category?: string
  updatedBy?: string
}) {
  const existing = await prisma.permission.findUnique({ where: { id } })
  if (!existing) throw { statusCode: 404, message: 'Permission not found' }
  if (data.name && data.name !== existing.name) {
    const duplicate = await prisma.permission.findUnique({ where: { name: data.name } })
    if (duplicate) throw { statusCode: 409, message: 'Permission name already exists' }
  }
  return prisma.permission.update({ where: { id }, data })
}
