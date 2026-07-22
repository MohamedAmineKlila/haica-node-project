<template>
  <section>
    <AccessDenied v-if="!hasAccess" />
    <template v-else>
    <div class="rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-card">
      <div class="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">Rapport hebdomadaire</h2>
        <button class="btn btn--secondary text-xs" type="button" @click="loadReport">
          <i class="pi pi-refresh mr-1"></i> Actualiser
        </button>
      </div>

      <div v-if="loading" class="flex items-center justify-center gap-3 p-12">
        <BaseSpinner size="lg" />
      </div>

      <AlertMessage v-else-if="loadError" :message="loadError" />

      <template v-else-if="report">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center">
            <p class="text-2xl font-bold text-haica-navy dark:text-white">{{ report.summary.totalUsers }}</p>
            <p class="text-xs text-slate-500 mt-1">Utilisateurs totaux</p>
          </div>
          <div class="rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center">
            <p class="text-2xl font-bold text-emerald-600">{{ report.summary.activeUsers }}</p>
            <p class="text-xs text-slate-500 mt-1">Actifs</p>
          </div>
          <div class="rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center">
            <p class="text-2xl font-bold text-haica-red">{{ report.summary.newUsersThisWeek }}</p>
            <p class="text-xs text-slate-500 mt-1">Nouveaux cette semaine</p>
          </div>
          <div class="rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center">
            <p class="text-2xl font-bold text-haica-navy dark:text-white">{{ report.summary.loginsThisWeek }}</p>
            <p class="text-xs text-slate-500 mt-1">Connexions cette semaine</p>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Par statut</h3>
            <div class="space-y-2">
              <div v-for="item in report.usersByStatus" :key="item.status" class="flex items-center gap-3">
                <span class="text-xs font-semibold w-20">{{ item.status }}</span>
                <div class="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500" :class="statusColor(item.status)" :style="{ width: `${(item.count / report.summary.totalUsers) * 100}%` }"></div>
                </div>
                <span class="text-xs font-bold text-slate-500 w-8 text-right">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Par rôle</h3>
            <div class="space-y-2">
              <div v-for="item in report.usersByRole" :key="item.role" class="flex items-center gap-3">
                <span class="text-xs font-semibold w-20">{{ item.role }}</span>
                <div class="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-haica-navy dark:bg-haica-red rounded-full transition-all duration-500" :style="{ width: `${(item.count / report.summary.totalUsers) * 100}%` }"></div>
                </div>
                <span class="text-xs font-bold text-slate-500 w-8 text-right">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Activité récente</h3>
          <div class="space-y-2 max-h-64 overflow-auto">
            <div v-for="log in report.recentActivity.slice(0, 20)" :key="log.id" class="flex items-center gap-3 text-xs py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
              <span class="font-bold text-slate-700 dark:text-slate-200">{{ log.action }}</span>
              <span class="text-slate-400">par {{ log.user }}</span>
              <span v-if="log.targetType" class="text-slate-400">→ {{ log.targetType }}</span>
              <span class="text-slate-400 ml-auto">{{ formatDate(log.createdAt) }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AccessDenied from '../../components/ui/AccessDenied.vue'
import AlertMessage from '../../components/ui/AlertMessage.vue'
import BaseSpinner from '../../components/ui/BaseSpinner.vue'
import { api } from '../../services/api'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const hasAccess = computed(() => auth.hasPermission('view_reports'))

const loading = ref(true)
const loadError = ref('')
const report = ref<any>(null)

function statusColor(status: string) {
  if (status === 'ACTIVE') return 'bg-emerald-500'
  if (status === 'SUSPENDED') return 'bg-orange-500'
  return 'bg-red-500'
}

function formatDate(value: string) {
  const d = new Date(value)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function loadReport() {
  loading.value = true; loadError.value = ''
  try {
    report.value = await api.get<any>('/reports/weekly')
  } catch (err: any) { loadError.value = err.message ?? 'Erreur de chargement.' }
  finally { loading.value = false }
}

onMounted(loadReport)
</script>
