import { prisma } from '../plugins/prisma'

interface AuditLogInput {
  action: string                 // e.g. 'USER_CREATED'
  userId?: string                // who performed the action
  targetId?: string              // the affected entity
  targetType?: string            // 'User' | 'Role' | 'Permission'
  details?: Record<string, any>  // any extra info (stored as JSON string)
  ip?: string
}

/**
 * logAudit — writes an audit log entry.
 * Always wraps in try/catch so audit failures never break the main request.
 */
export async function logAudit(data: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        userId: data.userId,
        targetId: data.targetId,
        targetType: data.targetType,
        details: data.details ? JSON.stringify(data.details) : null,
        ip: data.ip,
      },
    })
  } catch (err) {
    console.error('[AuditLog] Failed to write audit entry:', err)
  }
}
