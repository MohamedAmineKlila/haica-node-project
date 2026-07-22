import path from 'path'
import fs from 'fs'
import { pipeline } from 'stream/promises'
import type { FastifyRequest } from 'fastify'
import { updateAvatar } from '../modules/users/users.service'

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

/**
 * handleAvatarUpload — shared avatar upload logic.
 * Extracted from the duplicated PATCH /:id/avatar and PATCH /me/avatar handlers.
 */
export async function handleAvatarUpload(userId: string, request: FastifyRequest) {
  const data = await request.file()
  if (!data) throw { statusCode: 400, message: 'No file uploaded' }

  const ext = path.extname(data.filename).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw { statusCode: 400, message: 'Only image files are allowed (jpg, png, webp, gif)' }
  }

  const uploadsDir = path.join(process.cwd(), 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

  const filename = `avatar-${userId}-${Date.now()}${ext}`
  await pipeline(data.file, fs.createWriteStream(path.join(uploadsDir, filename)))

  const avatarUrl = `/uploads/${filename}`
  await updateAvatar(userId, avatarUrl)
  return avatarUrl
}
