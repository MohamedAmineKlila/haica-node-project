import { prisma } from '../../plugins/prisma'

const roleWithDetails = {
  include: {
    permissions: { include: { permission: true } },
    _count: { select: { users: true } },
  },
}

// ── List all roles ─────────────────────────────────────────────────────
export async function getRoles() {
  return prisma.role.findMany({ ...roleWithDetails, orderBy: { name: 'asc' } })
}

// ── Get single role ────────────────────────────────────────────────────
export async function getRoleById(id: string) {
  const role = await prisma.role.findUnique({ where: { id }, ...roleWithDetails })
  if (!role) throw { statusCode: 404, message: 'Role not found' }
  return role
}

// ── Create role ────────────────────────────────────────────────────────
export async function createRole(data: {
  name: string
  description?: string
  permissionIds?: string[]
  createdBy?: string
}) {
  const existing = await prisma.role.findUnique({ where: { name: data.name } })
  if (existing) throw { statusCode: 409, message: 'A role with this name already exists' }

  const role = await prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      permissions: data.permissionIds?.length
        ? { create: data.permissionIds.map((pid) => ({ permissionId: pid })) }
        : undefined,
    },
    ...roleWithDetails,
  })
  return role
}

// ── Update role ────────────────────────────────────────────────────────
export async function updateRole(
  id: string,
  data: { name?: string; description?: string; permissionIds?: string[]; updatedBy?: string },
) {
  const existing = await prisma.role.findUnique({ where: { id } })
  if (!existing) throw { statusCode: 404, message: 'Role not found' }

  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy

  // If permissionIds provided, replace all permissions
  if (data.permissionIds !== undefined) {
    await prisma.rolePermission.deleteMany({ where: { roleId: id } })
    updateData.permissions = {
      create: data.permissionIds.map((pid) => ({ permissionId: pid })),
    }
  }

  return prisma.role.update({ where: { id }, data: updateData, ...roleWithDetails })
}

// ── Delete role ────────────────────────────────────────────────────────
export async function deleteRole(id: string) {
  const existing = await prisma.role.findUnique({ where: { id } })
  if (!existing) throw { statusCode: 404, message: 'Role not found' }
  // Unassign role from all users first
  await prisma.user.updateMany({ where: { roleId: id }, data: { roleId: null } })
  await prisma.role.delete({ where: { id } })
}
