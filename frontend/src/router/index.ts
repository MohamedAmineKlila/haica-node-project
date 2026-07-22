import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import DashboardView from '../views/admin/DashboardView.vue'
import NotAuthorizedView from '../views/admin/NotAuthorizedView.vue'
import PermissionsView from '../views/admin/PermissionsView.vue'
import PermissionMatrix from '../views/admin/PermissionMatrix.vue'
import RolesView from '../views/admin/RolesView.vue'
import UsersView from '../views/admin/UsersView.vue'
import AuditLogView from '../views/admin/AuditLogView.vue'
import ProfileView from '../views/admin/ProfileView.vue'
import SessionsView from '../views/admin/SessionsView.vue'
import ReportsView from '../views/admin/ReportsView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0, left: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, title: 'Tableau de bord' },
      children: [
        {
          path: 'not-authorized',
          name: 'not-authorized',
          component: NotAuthorizedView,
          meta: { title: 'Accès non autorisé' },
        },
        {
          path: '',
          name: 'admin-dashboard',
          component: DashboardView,
          meta: { title: 'Tableau de bord', permission: 'view_dashboard' },
        },
        {
          path: 'users',
          name: 'admin-users',
          component: UsersView,
          meta: { title: 'Gestion des utilisateurs', permission: 'view_users' },
        },
        {
          path: 'roles',
          name: 'admin-roles',
          component: RolesView,
          meta: { title: 'Gestion des rôles', permission: 'view_roles' },
        },
        {
          path: 'permissions',
          name: 'admin-permissions',
          component: PermissionsView,
          meta: { title: 'Gestion des permissions', permission: 'view_permissions' },
        },
        {
          path: 'permission-matrix',
          name: 'admin-permission-matrix',
          component: PermissionMatrix,
          meta: { title: 'Matrice des permissions', permission: 'view_permissions' },
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: ReportsView,
          meta: { title: 'Rapports', permission: 'view_reports' },
        },
        {
          path: 'audit',
          name: 'admin-audit',
          component: AuditLogView,
          meta: { title: 'Journal d\'audit', permission: 'view_audit_logs' },
        },
        {
          path: 'profile',
          name: 'admin-profile',
          component: ProfileView,
          meta: { title: 'Mon profil' },
        },
        {
          path: 'sessions',
          name: 'admin-sessions',
          component: SessionsView,
          meta: { title: 'Mes sessions' },
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.query.fresh === '1') {
    auth.clear()
    return { path: '/login', query: undefined }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (auth.isAuthenticated && to.meta.guestOnly) {
    return { path: '/admin' }
  }

  if (auth.isAuthenticated && !auth.hydrated) {
    try {
      await auth.loadMe()
    } catch {
      auth.clear()
      return { path: '/login' }
    }
  }

  const permission = to.meta.permission as string | undefined
  if (permission && !auth.hasPermission(permission)) {
    return { name: 'not-authorized' }
  }
})

export default router
