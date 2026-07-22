/**
 * seed.ts — populates the database with default permissions, roles, and users.
 *
 * Run:  npm run db:seed   (inside /backend)
 */
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── All system permissions ──────────────────────────────────────────────
const PERMISSIONS = [
  // Dashboard
  { name: 'view_dashboard',    category: 'dashboard',   description: 'View the dashboard and analytics' },
  // Users
  { name: 'view_users',        category: 'users',       description: 'View user list and details' },
  { name: 'create_user',       category: 'users',       description: 'Create new users' },
  { name: 'edit_user',         category: 'users',       description: 'Edit existing users' },
  { name: 'delete_user',       category: 'users',       description: 'Delete users' },
  { name: 'manage_user_status',category: 'users',       description: 'Suspend or ban users' },
  // Roles
  { name: 'view_roles',        category: 'roles',       description: 'View roles and their permissions' },
  { name: 'create_role',       category: 'roles',       description: 'Create new roles' },
  { name: 'edit_role',         category: 'roles',       description: 'Edit roles and their permissions' },
  { name: 'delete_role',       category: 'roles',       description: 'Delete roles' },
  // Permissions
  { name: 'view_permissions',  category: 'permissions', description: 'View available permissions' },
  { name: 'manage_permissions',category: 'permissions', description: 'Create and delete permissions' },
  // Audit
  { name: 'view_audit_logs',   category: 'audit',       description: 'View the audit log' },
  // Reports
  { name: 'view_reports',      category: 'reports',     description: 'View system reports' },
]

// ── Role → permission mappings ──────────────────────────────────────────
const ROLES = [
  {
    name: 'Admin',
    description: 'Full access to everything',
    // Admin gets all permissions
    permissions: PERMISSIONS.map((p) => p.name),
  },
  {
    name: 'HR',
    description: 'Manages users and accounts',
    permissions: [
      'view_dashboard', 'view_users', 'create_user', 'edit_user',
      'manage_user_status', 'view_roles', 'view_audit_logs',
    ],
  },
  {
    name: 'Viewer',
    description: 'Read-only access to users and audit logs',
    permissions: ['view_dashboard', 'view_users', 'view_audit_logs'],
  },
]

// ── Sample users ─────────────────────────────────────────────────────────
const USERS = [
  { name: 'Admin HAICA',  email: 'admin@haica.tn',   password: 'Admin@123',   role: 'Admin' },
  { name: 'Sonia Ben Ali',email: 'hr@haica.tn',      password: 'Hr@12345',    role: 'HR' },
  { name: 'Leila Mansour',email: 'viewer@haica.tn',  password: 'Viewer@123',  role: 'Viewer' },
]

async function main() {
  console.log('🌱  Seeding database...\n')

  // 1. Create permissions
  console.log('  → Creating permissions...')
  const createdPerms: Record<string, string> = {}
  for (const perm of PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    })
    createdPerms[p.name] = p.id
  }

  // 2. Create roles and assign permissions
  console.log('  → Creating roles...')
  const createdRoles: Record<string, string> = {}
  for (const role of ROLES) {
    const { permissions: permNames, ...roleData } = role

    // Delete existing role permissions first (for re-seeding)
    const existingRole = await prisma.role.findUnique({ where: { name: role.name } })
    if (existingRole) {
      await prisma.rolePermission.deleteMany({ where: { roleId: existingRole.id } })
    }

    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: roleData.description },
      create: {
        name: roleData.name,
        description: roleData.description,
        permissions: {
          create: permNames
            .filter((n) => createdPerms[n])
            .map((n) => ({ permissionId: createdPerms[n] })),
        },
      },
    })

    // If the role existed, re-create permissions
    if (existingRole) {
      await prisma.rolePermission.createMany({
        data: permNames
          .filter((n) => createdPerms[n])
          .map((n) => ({ roleId: r.id, permissionId: createdPerms[n] })),
      })
    }

    createdRoles[r.name] = r.id
  }

  // 3. Create users
  console.log('  → Creating users...')
  for (const user of USERS) {
    const hashed = await bcrypt.hash(user.password, 10)
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashed,
        roleId: createdRoles[user.role],
        status: 'ACTIVE',
      },
    })
    console.log(`     ✓ ${user.name} (${user.email}) — role: ${user.role}`)
  }

  console.log('\n✅  Seeding complete!\n')
  console.log('  Login credentials:')
  console.log('  ┌─────────────────────────────┬──────────────┬──────────────┐')
  console.log('  │ Email                        │ Password     │ Role         │')
  console.log('  ├─────────────────────────────┼──────────────┼──────────────┤')
  USERS.forEach((u) =>
    console.log(`  │ ${u.email.padEnd(28)} │ ${u.password.padEnd(12)} │ ${u.role.padEnd(12)} │`)
  )
  console.log('  └─────────────────────────────┴──────────────┴──────────────┘\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
