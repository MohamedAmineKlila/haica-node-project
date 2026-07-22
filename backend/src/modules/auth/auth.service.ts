import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../plugins/prisma'
import { userWithRole } from '../../types'
import { config } from '../../config'
import { sanitize } from '../../utils/sanitize'

export async function loginService(
  email: string,
  password: string,
  fastify: FastifyInstance,
  ip?: string,
  userAgent?: string,
) {
  const user = await prisma.user.findUnique({
    where: { email },
    ...userWithRole,
  })

  if (!user) throw { statusCode: 401, message: 'Invalid email or password' }
  if (user.status !== 'ACTIVE') {
    throw { statusCode: 403, message: `Your account is ${user.status.toLowerCase()}` }
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw { statusCode: 401, message: 'Invalid email or password' }

  const accessToken = fastify.jwt.sign({ id: user.id, email: user.email })
  const refreshToken = crypto.randomBytes(64).toString('hex')

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + config.refreshTokenExpiryDays)

  await prisma.$transaction([
    prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt, ip: ip || null, userAgent: userAgent || null },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }),
  ])

  return { accessToken, refreshToken, user: sanitize(user) }
}

export async function refreshTokenService(token: string, fastify: FastifyInstance) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!stored) throw { statusCode: 401, message: 'Invalid refresh token' }
  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token } })
    throw { statusCode: 401, message: 'Refresh token has expired, please log in again' }
  }
  if (stored.user.status !== 'ACTIVE') {
    throw { statusCode: 403, message: 'Account suspended' }
  }

  const newRefreshToken = crypto.randomBytes(64).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + config.refreshTokenExpiryDays)

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { token } }),
    prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: stored.userId, expiresAt },
    }),
  ])

  const accessToken = fastify.jwt.sign({ id: stored.userId, email: stored.user.email })
  return { accessToken, refreshToken: newRefreshToken }
}

export async function logoutService(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } })
}

export async function getMeService(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    ...userWithRole,
  })
  if (!user) throw { statusCode: 404, message: 'User not found' }
  return sanitize(user)
}

export async function updateProfileService(
  userId: string,
  data: { name?: string; email?: string; currentPassword?: string; newPassword?: string },
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw { statusCode: 404, message: 'User not found' }

  const updateData: any = {}
  if (data.name) updateData.name = data.name
  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) throw { statusCode: 409, message: 'Email already in use' }
    updateData.email = data.email
  }
  if (data.newPassword) {
    if (!data.currentPassword) throw { statusCode: 400, message: 'Current password required' }
    const valid = await bcrypt.compare(data.currentPassword, user.password)
    if (!valid) throw { statusCode: 401, message: 'Current password is incorrect' }
    updateData.password = await bcrypt.hash(data.newPassword, config.bcryptRounds)
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    ...userWithRole,
  })
  return sanitize(updated)
}
