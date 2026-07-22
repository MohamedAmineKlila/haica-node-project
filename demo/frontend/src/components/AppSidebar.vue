<template>
  <aside class="app-sidebar">
    <div class="sidebar-brand">
      <i class="pi pi-prime"></i>
      <span>Haica</span>
    </div>
    <nav class="sidebar-nav">
      <router-link to="/" :class="{ active: active === 'dashboard' }">
        <i class="pi pi-home"></i> <span>Dashboard</span>
      </router-link>
      <router-link v-if="auth.hasPermission('users.view')" to="/users" :class="{ active: active === 'users' }">
        <i class="pi pi-users"></i> <span>Utilisateurs</span>
      </router-link>
      <router-link v-if="auth.hasPermission('roles.view')" to="/roles" :class="{ active: active === 'roles' }">
        <i class="pi pi-shield"></i> <span>Roles</span>
      </router-link>
      <router-link v-if="auth.hasPermission('permissions.view')" to="/permissions" :class="{ active: active === 'permissions' }">
        <i class="pi pi-key"></i> <span>Permissions</span>
      </router-link>
      <router-link v-if="auth.hasPermission('roles.edit')" to="/groupes" :class="{ active: active === 'groupes' }">
        <i class="pi pi-folder-open"></i> <span>Groupes</span>
      </router-link>
      <router-link v-if="auth.hasPermission('users.delete')" to="/health" :class="{ active: active === 'health' }">
        <i class="pi pi-heart"></i> <span>Health</span>
      </router-link>
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <i class="pi pi-user"></i>
        <span>{{ auth.user?.name }}</span>
      </div>
      <div class="sidebar-role">
        <span class="role-badge">{{ auth.user?.role_name }}</span>
      </div>
      <button class="sidebar-logout" @click="handleLogout">
        <i class="pi pi-sign-out"></i> Deconnexion
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

defineProps({
  active: { type: String, default: 'dashboard' },
})

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-sidebar {
  width: 250px;
  min-height: 100vh;
  background: #1e293b;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-brand {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #334155;
  margin-bottom: 8px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.sidebar-nav a {
  color: #94a3b8;
  text-decoration: none;
  padding: 11px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  transition: all 0.15s;
  border-left: 3px solid transparent;
}

.sidebar-nav a:hover {
  color: #fff;
  background: #334155;
}

.sidebar-nav a.active {
  color: #fff;
  background: #3b82f6;
  border-left-color: #60a5fa;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid #334155;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
  font-size: 13px;
  margin-bottom: 8px;
}

.sidebar-role {
  margin-bottom: 12px;
}

.role-badge {
  background: #475569;
  color: #e2e8f0;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.sidebar-logout {
  width: 100%;
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
  padding: 7px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;
}

.sidebar-logout:hover {
  background: #334155;
  color: #fff;
  border-color: #64748b;
}
</style>
