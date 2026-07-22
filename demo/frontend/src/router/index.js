import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import UsersView from '../views/UsersView.vue'
import RolesView from '../views/RolesView.vue'
import PermissionsView from '../views/PermissionsView.vue'
import GroupesView from '../views/GroupesView.vue'
import HealthView from '../views/HealthView.vue'

const routes = [
  { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
  { path: '/', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true, permission: 'dashboard.view' } },
  { path: '/users', name: 'users', component: UsersView, meta: { requiresAuth: true, permission: 'users.view' } },
  { path: '/roles', name: 'roles', component: RolesView, meta: { requiresAuth: true, permission: 'roles.view' } },
  { path: '/permissions', name: 'permissions', component: PermissionsView, meta: { requiresAuth: true, permission: 'permissions.view' } },
  { path: '/groupes', name: 'groupes', component: GroupesView, meta: { requiresAuth: true, permission: 'roles.edit' } },
  { path: '/health', name: 'health', component: HealthView, meta: { requiresAuth: true, permission: 'users.delete' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }

  if (to.meta.permission && !auth.hasPermission(to.meta.permission)) {
    return next('/')
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return next('/')
  }

  next()
})

export default router
