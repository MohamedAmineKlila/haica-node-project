<template>
  <div class="min-h-screen bg-[#E8EDF4] font-arabic text-black dark:bg-dark-surface-alt dark:text-dark-text" dir="ltr">
    <a href="#admin-main" class="skip-link">Aller au contenu principal</a>

    <!-- Mobile overlay -->
    <Transition name="fade">
      <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" @click="mobileOpen = false"></div>
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300"
      :class="[
        collapsed ? 'w-[82px]' : 'w-[270px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="flex h-full flex-col m-3 rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:bg-[#1E293B] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] overflow-hidden">

        <!-- Header logo -->
        <div class="pt-5 pb-3 flex justify-center" :class="collapsed ? 'px-2' : 'px-5'">
          <img src="../../assets/haica-logo.png" alt="HAICA" class="h-10 w-auto object-contain" :class="collapsed ? 'h-10' : 'h-10'" />
        </div>

        <!-- Nav list -->
        <nav class="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-hide" :class="collapsed ? 'flex flex-col items-center' : ''">
          <!-- Notifications at the top of the list -->
          <NotificationBell :collapsed="collapsed" />

          <RouterLink
            v-for="item in visibleItems"
            :key="item.to"
            class="sidebar-item"
            :class="{ 'sidebar-item--active': isActive(item.to) }"
            :to="item.to"
            :title="collapsed ? item.label : undefined"
          >
            <span class="sidebar-item__icon-wrap">
              <i :class="item.icon" class="sidebar-item__icon"></i>
            </span>
            <Transition name="fade">
              <span v-if="!collapsed" class="sidebar-item__label">{{ item.label }}</span>
            </Transition>
          </RouterLink>
        </nav>

        <!-- Bottom items: Dark mode & Déconnexion -->
        <div class="px-3 pt-2 pb-3 border-t border-slate-100 dark:border-slate-700/50 space-y-1" :class="collapsed ? 'flex flex-col items-center' : ''">
          <div
            class="sidebar-item cursor-pointer"
            title="Mode clair/sombre"
            @click="toggleDarkMode"
          >
            <span class="sidebar-item__icon-wrap">
              <i :class="isDark ? 'pi pi-moon' : 'pi pi-sun'" class="sidebar-item__icon"></i>
            </span>
            <Transition name="fade">
              <span v-if="!collapsed" class="sidebar-item__label">{{ isDark ? 'Mode sombre' : 'Mode clair' }}</span>
            </Transition>
          </div>

          <div class="sidebar-item cursor-pointer" type="button" title="Déconnexion" @click="logout">
            <span class="sidebar-item__icon-wrap">
              <i class="pi pi-sign-out sidebar-item__icon"></i>
            </span>
            <Transition name="fade">
              <span v-if="!collapsed" class="sidebar-item__label">Déconnexion</span>
            </Transition>
          </div>
        </div>

        <!-- User profile -->
        <div class="border-t-2 border-slate-200 dark:border-slate-600" data-profile-menu>
          <div class="sidebar-item">
            <span class="sidebar-item__icon-wrap relative shrink-0">
              <span v-if="auth.user?.avatar" class="h-8 w-8 overflow-hidden rounded-full block">
                <img :src="resolveAvatarUrl(auth.user.avatar)" class="h-full w-full object-cover" alt="" />
              </span>
              <span v-else class="grid h-8 w-8 place-items-center rounded-full bg-haica-navy text-xs font-bold text-white">{{ initials }}</span>
              <span class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-[#1E293B]"></span>
            </span>
            <Transition name="fade">
              <div v-if="!collapsed" class="min-w-0 flex-1">
                <p class="text-sm font-bold text-slate-800 truncate dark:text-white">{{ auth.user?.name ?? 'Admin' }}</p>
                <p class="text-xs text-slate-400 truncate dark:text-slate-500">{{ auth.user?.role?.name ?? 'Utilisateur' }}</p>
              </div>
            </Transition>
            <Transition name="fade">
              <button
                v-if="!collapsed"
                class="shrink-0 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                type="button"
                title="Paramètres"
                @click.stop="profileMenuOpen = !profileMenuOpen"
              >
                <i class="pi pi-ellipsis-v text-sm"></i>
              </button>
            </Transition>
          </div>

          <!-- Profile dropdown -->
          <Transition name="dropdown">
            <div v-if="profileMenuOpen && !collapsed" class="mx-3 mb-2 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-[#1E293B] z-50">
              <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800" type="button" @click="profileMenuOpen = false; goTo('/admin/profile')">
                <i class="pi pi-user text-xs"></i>
                Mon profil
              </button>
              <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800" type="button" @click="profileMenuOpen = false; goTo('/admin/sessions')">
                <i class="pi pi-desktop text-xs"></i>
                Mes sessions
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Collapse toggle -->
      <button
        class="absolute -right-3 top-1/2 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-all hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-[#1E293B] dark:text-slate-400 dark:hover:bg-slate-800"
        type="button"
        :style="{ transform: 'translateY(-50%)' }"
        title="Réduire / Étendre"
        @click="collapsed = !collapsed"
      >
        <i class="pi pi-angle-double-left text-[10px] transition-transform duration-300" :class="{ 'rotate-180': collapsed }"></i>
      </button>
    </aside>

    <!-- Mobile hamburger -->
    <button
      class="fixed top-5 left-5 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-lg transition-colors hover:bg-slate-50 lg:hidden dark:bg-[#1E293B] dark:text-white"
      type="button"
      aria-label="Ouvrir la navigation"
      @click="mobileOpen = !mobileOpen"
    >
      <i :class="mobileOpen ? 'pi pi-times' : 'pi pi-bars'"></i>
    </button>

    <!-- Main content -->
    <main
      id="admin-main"
      class="transition-all duration-300 min-h-screen"
      :class="collapsed ? 'lg:ml-[88px]' : 'lg:ml-[276px]'"
    >
      <div class="p-6">
        <RouterView v-slot="{ Component }">
          <Transition :name="transitionName" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { resolveAvatarUrl } from '../../services/api'
import { useTheme } from '../../composables/useTheme'
import NotificationBell from '../../components/ui/NotificationBell.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isDark, toggleDarkMode } = useTheme()
const collapsed = ref(false)
const mobileOpen = ref(false)
const profileMenuOpen = ref(false)

const initials = computed(() => {
  const name = auth.user?.name ?? ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? ''
  return (first + last).toUpperCase()
})

const transitionName = computed(() => {
  const depth = route.path.split('/').length
  return depth > 2 ? 'page-slide-left' : 'page-slide-right'
})

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}

const allItems = [
  { to: '/admin', label: 'Tableau de bord', icon: 'pi pi-th-large', permission: 'view_dashboard' },
  { to: '/admin/users', label: 'Utilisateurs', icon: 'pi pi-users', permission: 'view_users' },
  { to: '/admin/roles', label: 'Rôles', icon: 'pi pi-shield', permission: 'view_roles' },
  { to: '/admin/permissions', label: 'Permissions', icon: 'pi pi-key', permission: 'view_permissions' },
  { to: '/admin/audit', label: 'Audit', icon: 'pi pi-history', permission: 'view_audit_logs' },
  { to: '/admin/reports', label: 'Rapports', icon: 'pi pi-chart-bar', permission: 'view_reports' },
]

const visibleItems = computed(() =>
  allItems.filter((item) => !item.permission || auth.hasPermission(item.permission)),
)

async function logout() {
  mobileOpen.value = false
  await auth.logout()
  await router.push('/login')
}

function goTo(path: string) {
  mobileOpen.value = false
  if (route.path !== path) void router.push(path)
}

function onProfileClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('[data-profile-menu]')) {
    profileMenuOpen.value = false
  }
}

function onResize() {
  if (window.innerWidth >= 1024) mobileOpen.value = false
}
onMounted(() => {
  window.addEventListener('resize', onResize)
  document.addEventListener('click', onProfileClickOutside)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('click', onProfileClickOutside)
})
</script>

<style scoped>
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  z-index: 9999;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: #BA2227;
  color: #fff;
  font-weight: 700;
  border-radius: 0 0 12px 12px;
  text-decoration: none;
}
.skip-link:focus { top: 0; }

.scrollbar-hide {
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.page-slide-left-enter-active,
.page-slide-left-leave-active,
.page-slide-right-enter-active,
.page-slide-right-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-slide-left-enter-from { opacity: 0; transform: translateX(-12px); }
.page-slide-left-leave-to { opacity: 0; transform: translateX(12px); }
.page-slide-right-enter-from { opacity: 0; transform: translateX(12px); }
.page-slide-right-leave-to { opacity: 0; transform: translateX(-12px); }
</style>
