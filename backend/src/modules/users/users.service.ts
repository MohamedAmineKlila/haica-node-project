import bcrypt from 'bcryptjs'
import { prisma } from '../../plugins/prisma'
import { userWithRole } from '../../types'
import { config } from '../../config'
import { sanitize } from '../../utils/sanitize'

// ── List users (paginated + searchable + filterable) ───────────────────
export async function getUsers(params: {
  page: number
  limit: number
  search?: string
  roleId?: string
  status?: string
}) {
  const { page, limit, search, roleId, status } = params
  const skip = (page - 1) * limit

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ]
  }
  if (roleId) where.roleId = roleId
  if (status) where.status = status

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      ...userWithRole,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return {
    data: users.map(sanitize),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

// ── Get single user ────────────────────────────────────────────────────
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, ...userWithRole })
  if (!user) throw { statusCode: 404, message: 'User not found' }
  return sanitize(user)
}

// ── Create user ────────────────────────────────────────────────────────
export async function createUser(data: {
  name: string
  email: string
  password: string
  roleId?: string
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw { statusCode: 409, message: 'A user with this email already exists' }

  const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds)

  const user = await prisma.user.create({
    data: { ...data, password: hashedPassword },
    ...userWithRole,
  })
  return sanitize(user)
}

// ── Update user ────────────────────────────────────────────────────────
export async function updateUser(
  id: string,
  data: {
    name?: string
    email?: string
    password?: string
    roleId?: string | null
    status?: string
  },
) {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw { statusCode: 404, message: 'User not found' }

  // Check email uniqueness if changing it
  if (data.email && data.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: data.email } })
    if (emailTaken) throw { statusCode: 409, message: 'Email already in use' }
  }

  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.roleId !== undefined) updateData.roleId = data.roleId
  if (data.status !== undefined) updateData.status = data.status
  if (data.password) updateData.password = await bcrypt.hash(data.password, config.bcryptRounds)

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    ...userWithRole,
  })
  return sanitize(user)
}

// ── Soft delete user ───────────────────────────────────────────────────
export async function deleteUser(id: string) {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw { statusCode: 404, message: 'User not found' }
  if (existing.status === 'DELETED') throw { statusCode: 400, message: 'User is already deleted' }
  await prisma.user.update({
    where: { id },
    data: { status: 'DELETED' },
  })
  await prisma.refreshToken.deleteMany({ where: { userId: id } })
}

// ── Restore soft-deleted user ──────────────────────────────────────────
export async function restoreUser(id: string) {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw { statusCode: 404, message: 'User not found' }
  if (existing.status !== 'DELETED') throw { statusCode: 400, message: 'User is not deleted' }
  const user = await prisma.user.update({
    where: { id },
    data: { status: 'ACTIVE' },
    ...userWithRole,
  })
  return sanitize(user)
}

// ── Update avatar path ─────────────────────────────────────────────────
export async function updateAvatar(userId: string, avatarPath: string) {
  await prisma.user.update({ where: { id: userId }, data: { avatar: avatarPath } })
  return avatarPath
}

// ── Delete avatar ──────────────────────────────────────────────────────
export async function deleteAvatar(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { avatar: null } })
}

// ── Bulk create users ──────────────────────────────────────────────────
export async function bulkCreateUsers(users: Array<{ name: string; email: string; password: string; roleId?: string }>) {
  const results = { created: 0, failed: 0, errors: [] as string[] }

  for (const userData of users) {
    try {
      const existing = await prisma.user.findUnique({ where: { email: userData.email } })
      if (existing) {
        results.failed++
        results.errors.push(`${userData.email}: email déjà utilisé`)
        continue
      }
      const hashedPassword = await bcrypt.hash(userData.password, config.bcryptRounds)
      await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          roleId: userData.roleId || null,
          status: 'ACTIVE',
        },
      })
      results.created++
    } catch {
      results.failed++
      results.errors.push(`${userData.email}: erreur lors de la création`)
    }
  }
  return results
}

// ── Bulk role assignment ───────────────────────────────────────────────
export async function bulkAssignRole(userIds: string[], roleId: string) {
  const role = await prisma.role.findUnique({ where: { id: roleId } })
  if (!role) throw { statusCode: 404, message: 'Role not found' }

  await prisma.user.updateMany({
    where: { id: { in: userIds } },
    data: { roleId },
  })

  return { updated: userIds.length }
}
