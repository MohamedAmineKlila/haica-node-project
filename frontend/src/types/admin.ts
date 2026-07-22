export type Permission = {
  id: string
  name: string
  description?: string | null
  category?: string | null
}

export type RolePermission = {
  permission: Permission
}

export type Role = {
  id: string
  name: string
  description?: string | null
  permissions: RolePermission[]
  _count?: {
    users: number
  }
}

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED'

export type User = {
  id: string
  name: string
  email: string
  avatar?: string | null
  status: UserStatus
  roleId?: string | null
  role?: Role | null
  lastLoginAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type PaginatedUsers = {
  data: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type DashboardStats = {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  bannedUsers: number
  totalRoles: number
  totalAuditLogs: number
  usersByRole: Array<{ name: string; count: number }>
  recentActivity: Array<{
    id: string
    action: string
    targetType?: string | null
    ip?: string | null
    createdAt: string
    user?: { name: string } | null
  }>
}

export type AuditLog = {
  id: string
  action: string
  details?: string | null
  userId?: string | null
  user?: { id: string; name: string; email: string } | null
  targetId?: string | null
  targetType?: string | null
  ip?: string | null
  createdAt: string
}
