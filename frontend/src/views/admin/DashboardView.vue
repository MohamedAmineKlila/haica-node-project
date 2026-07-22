<template>
  <section>
    <AccessDenied v-if="!hasAccess" />

    <template v-else>
    <div v-if="loading" class="space-y-6">
      <div ref="skeletonRef" class="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <article v-for="i in 6" :key="i" class="dashboard-card rounded-xl p-5 shadow-card">
          <div class="skeleton h-3 w-2/3 rounded"></div>
          <div class="skeleton mt-3 h-8 w-1/2 rounded"></div>
        </article>
      </div>
      <div class="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div class="dashboard-panel rounded-xl p-5">
          <div class="skeleton h-5 w-1/2 rounded"></div>
          <div class="mt-5 space-y-4">
            <div v-for="i in 3" :key="i">
              <div class="skeleton h-4 w-full rounded"></div>
              <div class="skeleton mt-2 h-2 w-full rounded"></div>
            </div>
          </div>
        </div>
        <div class="dashboard-panel rounded-xl p-5">
          <div class="skeleton h-5 w-1/3 rounded"></div>
          <div class="mt-5 space-y-3">
            <div v-for="i in 4" :key="i" class="skeleton h-6 w-full rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <AlertMessage v-else-if="error" :message="error" />

    <div v-else-if="stats" class="space-y-6">
      <div class="flex justify-end">
        <button
          class="csv-export-button"
          type="button"
          :class="{ 'csv-export-button--done': exporting }"
          :disabled="exporting"
          @click="exportDashboardCsv"
        >
          <span class="csv-export-button__icon">
            <i :class="exporting ? 'pi pi-check' : 'pi pi-download'"></i>
          </span>
          <span>{{ exporting ? 'Exporté' : 'Exporter CSV' }}</span>
        </button>
      </div>

      <div ref="cardsContainer" class="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <article
          v-for="card in cards"
          :key="card.label"
          class="dashboard-card rounded-xl p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover card-entrance"
          :style="{ '--card-delay': `${cards.indexOf(card) * 80}ms` }"
        >
          <p class="text-sm font-bold text-[#666666] dark:text-dark-muted">{{ card.label }}</p>
          <strong class="mt-2 block text-[24px] leading-[36px] tabular-nums">{{ animateValue(card) }}</strong>
        </article>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="dashboard-panel rounded-xl p-5">
          <h2 class="text-[18px] font-bold leading-[27px]">Utilisateurs par rôle</h2>
          <div class="mt-5 space-y-4">
            <div v-for="role in stats.usersByRole" :key="role.name">
              <div class="mb-2 flex justify-between text-sm">
                <span class="font-bold">{{ role.name }}</span>
                <span class="tabular-nums">{{ role.count }}</span>
              </div>
              <div class="h-2 rounded-full bg-[#efefef] dark:bg-white/10">
                <div
                  class="h-2 rounded-full bg-haica-red transition-all duration-1000 ease-out"
                  :style="{ width: `${barWidth(role.count)}%` }"
                  ref="barRef"
                ></div>
              </div>
            </div>
          </div>
        </section>

        <section class="dashboard-panel rounded-xl p-5">
          <h2 class="text-[18px] font-bold leading-[27px] mb-4">Répartition par statut</h2>
          <div class="flex items-center justify-center gap-8">
            <div class="relative">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="56" fill="none" stroke="#e2e8f0" stroke-width="14" class="dark:stroke-slate-700"/>
                <circle v-if="stats.activeUsers" cx="70" cy="70" r="56" fill="none" stroke="#16a34a" stroke-width="14"
                  :stroke-dasharray="statusArc.active" stroke-dashoffset="0"
                  stroke-linecap="round" class="donut-ring" style="transform: rotate(-90deg); transform-origin: center;"/>
                <circle v-if="stats.suspendedUsers" cx="70" cy="70" r="56" fill="none" stroke="#d97706" stroke-width="14"
                  :stroke-dasharray="statusArc.suspended" :stroke-dashoffset="-statusArc.suspendedOffset"
                  stroke-linecap="round" class="donut-ring" style="transform: rotate(-90deg); transform-origin: center;"/>
                <circle v-if="stats.bannedUsers" cx="70" cy="70" r="56" fill="none" stroke="#dc2626" stroke-width="14"
                  :stroke-dasharray="statusArc.banned" :stroke-dashoffset="-statusArc.bannedOffset"
                  stroke-linecap="round" class="donut-ring" style="transform: rotate(-90deg); transform-origin: center;"/>
                <text x="70" y="66" text-anchor="middle" class="fill-slate-800 dark:fill-white text-[22px] font-extrabold">{{ stats.totalUsers }}</text>
                <text x="70" y="84" text-anchor="middle" class="fill-slate-400 dark:fill-slate-500 text-[11px] font-bold">total</text>
              </svg>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-2.5">
                <span class="h-3 w-3 rounded-full bg-[#16a34a]"></span>
                <span class="text-sm font-bold text-slate-700 dark:text-slate-200">Actifs</span>
                <span class="text-sm tabular-nums text-slate-500 dark:text-slate-400 ml-auto">{{ stats.activeUsers }}</span>
              </div>
              <div class="flex items-center gap-2.5">
                <span class="h-3 w-3 rounded-full bg-[#d97706]"></span>
                <span class="text-sm font-bold text-slate-700 dark:text-slate-200">Suspendus</span>
                <span class="text-sm tabular-nums text-slate-500 dark:text-slate-400 ml-auto">{{ stats.suspendedUsers }}</span>
              </div>
              <div class="flex items-center gap-2.5">
                <span class="h-3 w-3 rounded-full bg-[#dc2626]"></span>
                <span class="text-sm font-bold text-slate-700 dark:text-slate-200">Bannis</span>
                <span class="text-sm tabular-nums text-slate-500 dark:text-slate-400 ml-auto">{{ stats.bannedUsers }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section class="dashboard-panel rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[18px] font-bold leading-[27px]">Activité récente</h2>
          <select
            v-model="auditPageSize"
            class="admin-input !mt-0 w-[100px] text-xs focus:ring-2 focus:ring-haica-red focus:border-haica-red dark:bg-[#1E293B]"
            @change="auditCurrentPage = 1; loadAuditLogs()"
          >
            <option :value="5">5 / page</option>
            <option :value="10">10 / page</option>
            <option :value="20">20 / page</option>
          </select>
        </div>
        <div class="mt-2">
          <div v-if="auditLoading && !auditLogs.length" class="flex items-center justify-center gap-3 py-8">
            <BaseSpinner size="sm" />
            <span class="text-sm text-slate-500">Chargement...</span>
          </div>
          <Transition v-else name="table-fade" mode="out-in">
            <div :key="auditCurrentPage">
              <div v-if="auditError" class="p-6 text-center">
                <i class="pi pi-lock text-3xl text-slate-300 dark:text-slate-600 mb-2 block"></i>
                <p class="text-sm font-bold text-slate-500 dark:text-slate-400">{{ auditError }}</p>
              </div>
              <EmptyState
                v-else-if="!auditLogs.length"
                icon="pi pi-history"
                title="Aucune activité récente"
                description="Les actions des utilisateurs apparaîtront ici."
              />
              <div v-else class="timeline">
                <div
                  v-for="(entry, idx) in sortedLogs"
                  :key="entry.id"
                  class="timeline-item"
                  :style="{ '--item-delay': `${idx * 60}ms` }"
                >
                  <div class="timeline-dot" :class="actionColorClass(entry.action)">
                    <i :class="actionIcon(entry.action)" class="text-[10px]"></i>
                  </div>
                  <div class="timeline-line"></div>
                  <div class="timeline-content">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <span class="font-bold text-sm text-slate-800 dark:text-white">{{ formatAction(entry.action) }}</span>
                      <span class="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{{ relativeTime(entry.createdAt) }}</span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span class="font-semibold">{{ entry.user?.name ?? 'Système' }}</span>
                      <span v-if="entry.targetType"> → {{ entry.targetType }}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-3">
                <BasePagination
                  :current-page="auditCurrentPage"
                  :total-pages="auditTotalPages"
                  :page-size="auditPageSize"
                  :total="auditTotal"
                  @change="goToAuditPage"
                />
              </div>
            </div>
          </Transition>
        </div>
      </section>
    </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue'
import AccessDenied from '../../components/ui/AccessDenied.vue'
import AlertMessage from '../../components/ui/AlertMessage.vue'
import BasePagination from '../../components/ui/BasePagination.vue'
import BaseSpinner from '../../components/ui/BaseSpinner.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import { api } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import type { DashboardStats } from '../../types/admin'

const auth = useAuthStore()
const hasAccess = computed(() => auth.hasPermission('view_dashboard'))

const stats = ref<DashboardStats | null>(null)
const loading = ref(true)
const error = ref('')
const exporting = ref(false)
const auditLogs = ref<any[]>([])
const auditLoading = ref(true)
const auditError = ref('')
const auditCurrentPage = ref(1)
const auditTotalPages = ref(1)
const auditTotal = ref(0)
const auditPageSize = ref(10)

const circumference = 2 * Math.PI * 56

const statusArc = computed(() => {
  const total = stats.value?.totalUsers || 1
  const active = stats.value?.activeUsers || 0
  const suspended = stats.value?.suspendedUsers || 0
  const banned = stats.value?.bannedUsers || 0

  const activeLen = (active / total) * circumference
  const suspendedLen = (suspended / total) * circumference
  const bannedLen = (banned / total) * circumference

  return {
    active: `${activeLen} ${circumference - activeLen}`,
    suspended: `${suspendedLen} ${circumference - suspendedLen}`,
    banned: `${bannedLen} ${circumference - bannedLen}`,
    activeOffset: 0,
    suspendedOffset: activeLen,
    bannedOffset: activeLen + suspendedLen,
  }
})

const sortedLogs = computed(() => {
  return [...auditLogs.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

function actionColorClass(action: string) {
  const a = action.toLowerCase()
  if (a.includes('créé') || a.includes('created') || a.includes('ajout')) return 'timeline-dot--green'
  if (a.includes('connect') || a.includes('login') || a.includes('connexion')) return 'timeline-dot--blue'
  if (a.includes('supprim') || a.includes('deleted') || a.includes('banni') || a.includes('suspendu')) return 'timeline-dot--red'
  if (a.includes('modifié') || a.includes('updated') || a.includes('modif')) return 'timeline-dot--amber'
  if (a.includes('export')) return 'timeline-dot--purple'
  return 'timeline-dot--slate'
}

function actionIcon(action: string) {
  const a = action.toLowerCase()
  if (a.includes('créé') || a.includes('ajout')) return 'pi pi-plus'
  if (a.includes('connect') || a.includes('login') || a.includes('connexion')) return 'pi pi-sign-in'
  if (a.includes('supprim')) return 'pi pi-trash'
  if (a.includes('banni')) return 'pi pi-ban'
  if (a.includes('suspendu')) return 'pi pi-pause'
  if (a.includes('modifié')) return 'pi pi-pencil'
  if (a.includes('export')) return 'pi pi-download'
  if (a.includes('activé') || a.includes('réactivé')) return 'pi pi-check-circle'
  return 'pi pi-circle-fill'
}

function formatAction(action: string) {
  return action
}

function relativeTime(value: string) {
  const now = Date.now()
  const then = new Date(value).getTime()
  const diff = Math.max(0, now - then)
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return "à l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days}j`
  return formatDate(value)
}

const cards = computed(() => [
  { label: 'Utilisateurs', value: stats.value?.totalUsers ?? 0, key: 'totalUsers' },
  { label: 'Actifs', value: stats.value?.activeUsers ?? 0, key: 'activeUsers' },
  { label: 'Suspendus', value: stats.value?.suspendedUsers ?? 0, key: 'suspendedUsers' },
  { label: 'Bannis', value: stats.value?.bannedUsers ?? 0, key: 'bannedUsers' },
  { label: 'Rôles', value: stats.value?.totalRoles ?? 0, key: 'totalRoles' },
  { label: 'Audits', value: stats.value?.totalAuditLogs ?? 0, key: 'totalAuditLogs' },
])

const animatedValues = ref<Record<string, number>>({})

function animateValue(card: { label: string; value: number; key: string }) {
  const current = animatedValues.value[card.key]
  if (current === undefined) return '0'
  return current.toLocaleString('fr-FR')
}

function startCountUp() {
  for (const card of cards.value) {
    const target = card.value
    const duration = 1200
    const steps = 30
    const stepTime = duration / steps
    let step = 0
    const interval = setInterval(() => {
      step++
      const progress = Math.min(step / steps, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      animatedValues.value[card.key] = Math.round(target * eased)
      if (progress >= 1) clearInterval(interval)
    }, stepTime)
  }
}

function barWidth(count: number) {
  const max = Math.max(...(stats.value?.usersByRole.map((role) => role.count) ?? [1]), 1)
  return Math.round((count / max) * 100)
}

function formatDate(value: string) {
  const date = new Date(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function exportDashboardCsv() {
  if (!stats.value || exporting.value) return

  const rows: Array<Array<string | number>> = [
    ['Section', 'Indicateur', 'Valeur'],
    ...cards.value.map((card) => ['Résumé', card.label, card.value]),
    [],
    ['Utilisateurs par rôle', 'Rôle', 'Nombre'],
    ...stats.value.usersByRole.map((role) => ['Utilisateurs par rôle', role.name, role.count]),
    [],
    ['Activité récente', 'Action', 'Utilisateur', 'Cible', 'Date'],
    ...stats.value.recentActivity.map((entry) => [
      'Activité récente',
      entry.action,
      entry.user?.name ?? 'Système',
      entry.targetType ?? '-',
      formatDate(entry.createdAt),
    ]),
  ]

  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `tableau-de-bord-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  exporting.value = true
  window.setTimeout(() => {
    exporting.value = false
  }, 1400)
}

onMounted(async () => {
  try {
    stats.value = await api.get<DashboardStats>('/dashboard/stats')
    await nextTick()
    startCountUp()
    await loadAuditLogs()
  } catch (err: any) {
    error.value = err.message ?? 'Impossible de charger le tableau de bord.'
  } finally {
    loading.value = false
  }
})

async function loadAuditLogs(page?: number) {
  auditLoading.value = true
  auditError.value = ''
  try {
    const p = page ?? auditCurrentPage.value
    const res = await api.get<{ data: any[]; total: number; totalPages: number }>(`/audit?page=${p}&limit=${auditPageSize.value}`)
    auditLogs.value = res.data
    auditTotal.value = res.total
    auditTotalPages.value = res.totalPages
    if (page !== undefined) auditCurrentPage.value = page
  } catch {
    auditError.value = 'Accès non autorisé'
  } finally {
    auditLoading.value = false
  }
}

function goToAuditPage(page: number) {
  loadAuditLogs(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.table-fade-enter-active,
.table-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.table-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.table-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.card-entrance {
  animation: cardIn 0.4s ease both;
  animation-delay: var(--card-delay);
}
@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Donut chart */
.donut-ring {
  animation: donutDraw 1s ease both;
}
@keyframes donutDraw {
  from { stroke-dashoffset: 352; }
}

/* Timeline */
.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
}
.timeline-item {
  position: relative;
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  padding-left: 2px;
  animation: timelineIn 0.35s ease both;
  animation-delay: var(--item-delay);
}
.timeline-item:last-child {
  padding-bottom: 0;
}
.timeline-item:last-child .timeline-line {
  display: none;
}
.timeline-dot {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 0 3px var(--dot-ring, rgba(148,163,184,0.2));
}
.timeline-dot--green  { background: #16a34a; --dot-ring: rgba(22,163,74,0.15); }
.timeline-dot--blue   { background: #2563eb; --dot-ring: rgba(37,99,235,0.15); }
.timeline-dot--red    { background: #dc2626; --dot-ring: rgba(220,38,38,0.15); }
.timeline-dot--amber  { background: #d97706; --dot-ring: rgba(217,119,6,0.15); }
.timeline-dot--purple { background: #7c3aed; --dot-ring: rgba(124,58,237,0.15); }
.timeline-dot--slate  { background: #64748b; --dot-ring: rgba(100,116,139,0.15); }
.timeline-line {
  position: absolute;
  left: 15px;
  top: 28px;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
  border-radius: 1px;
}
.dark .timeline-line {
  background: #334155;
}
.timeline-content {
  flex: 1;
  min-width: 0;
  padding-top: 3px;
}
@keyframes timelineIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
