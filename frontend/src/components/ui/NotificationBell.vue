<template>
  <div ref="bellRef" class="sidebar-item cursor-pointer" @click="open = !open">
    <span class="sidebar-item__icon-wrap relative">
      <i class="pi pi-bell sidebar-item__icon"></i>
      <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-haica-red text-[9px] font-bold text-white">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </span>
    <Transition name="fade">
      <span v-if="!collapsed" class="sidebar-item__label">Notifications</span>
    </Transition>

    <Teleport to="body">
      <Transition name="dropdown">
        <div v-if="open" class="fixed z-[9999] w-80 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-[#1E293B]" :style="dropdownStyle">
          <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">Notifications</h3>
            <button v-if="unreadCount > 0" class="text-xs font-bold text-haica-red hover:underline" type="button" @click="markAllRead">
              Tout marquer comme lu
            </button>
          </div>
          <div class="max-h-80 overflow-y-auto">
            <div v-if="loading" class="flex justify-center py-6">
              <BaseSpinner size="sm" />
            </div>
            <p v-else-if="!notifications.length" class="py-6 text-center text-sm text-slate-400">
              Aucune notification
            </p>
            <div v-else>
              <div
                v-for="n in notifications"
                :key="n.id"
                class="flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition-colors dark:border-slate-800"
                :class="[
                  getNotificationLink(n) ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                  { 'bg-blue-50/50 dark:bg-blue-900/10': !n.read }
                ]"
                @click="clickNotification(n)"
              >
                <span class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs"
                  :class="n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : n.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'">
                  <i :class="n.type === 'success' ? 'pi pi-check' : n.type === 'error' ? 'pi pi-times' : 'pi pi-info'"></i>
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ n.title }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ n.message }}</p>
                  <div class="flex items-center gap-1.5 mt-1">
                    <p class="text-[10px] text-slate-400">{{ formatTime(n.createdAt) }}</p>
                    <i v-if="getNotificationLink(n)" class="pi pi-arrow-right text-[8px] text-haica-red"></i>
                  </div>
                </div>
                <button v-if="!n.read" class="shrink-0 text-slate-400 hover:text-haica-red transition-colors" type="button" title="Marquer comme lu" @click.stop="markRead(n.id)">
                  <i class="pi pi-check text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../services/api'
import BaseSpinner from './BaseSpinner.vue'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

const router = useRouter()
defineProps<{ collapsed?: boolean }>()
const open = ref(false)
const loading = ref(false)
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const bellRef = ref<HTMLElement | null>(null)
let pollInterval: ReturnType<typeof setInterval> | null = null

const dropdownStyle = computed(() => {
  if (!bellRef.value) return { top: '60px', left: '100px' }
  const rect = bellRef.value.getBoundingClientRect()
  return {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
  }
})

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'à l\'instant'
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function getNotificationLink(n: Notification) {
  if (n.message.includes('nouvel utilisateur') || n.message.includes('créé')) return '/admin/utilisateurs'
  if (n.message.includes('rôle') || n.message.includes('permission')) return '/admin/roles'
  if (n.message.includes('audit') || n.message.includes('action')) return '/admin/audit'
  return null
}

async function clickNotification(n: Notification) {
  const link = getNotificationLink(n)
  if (!n.read) await markRead(n.id)
  open.value = false
  if (link) router.push(link)
}

async function fetchNotifications() {
  try {
    loading.value = true
    const res = await api.get('/notifications')
    notifications.value = res.data.notifications || res.data
    unreadCount.value = notifications.value.filter(n => !n.read).length
  } catch {
  } finally {
    loading.value = false
  }
}

async function markRead(id: string) {
  try {
    await api.patch(`/notifications/${id}/read`)
    const n = notifications.value.find(n => n.id === id)
    if (n) n.read = true
    unreadCount.value = notifications.value.filter(n => !n.read).length
  } catch {}
}

async function markAllRead() {
  try {
    await api.patch('/notifications/read-all')
    notifications.value.forEach(n => n.read = true)
    unreadCount.value = 0
  } catch {}
}

function handleClickOutside(e: MouseEvent) {
  if (bellRef.value && !bellRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  fetchNotifications()
  pollInterval = setInterval(fetchNotifications, 30000)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px) scale(0.95); }
</style>
