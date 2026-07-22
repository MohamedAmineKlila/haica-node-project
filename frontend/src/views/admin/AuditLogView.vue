<template>
  <section>
    <AccessDenied v-if="!hasAccess" />
    <template v-else>
    <div class="rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-card">
      <div class="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">Journal d'audit</h2>
        <div class="flex items-center gap-3">
          <select
            v-model="pageSize"
            class="admin-input !mt-0 w-[100px] text-xs focus:ring-2 focus:ring-haica-red focus:border-haica-red dark:bg-[#1E293B]"
            @change="loadLogs"
          >
            <option :value="10">10 / page</option>
            <option :value="20">20 / page</option>
            <option :value="50">50 / page</option>
            <option :value="100">100 / page</option>
          </select>
          <input
            v-model="dateFrom"
            type="date"
            class="admin-input !mt-0 w-[140px] text-xs focus:ring-2 focus:ring-haica-red focus:border-haica-red dark:bg-[#1E293B]"
            aria-label="Date de début"
            @change="loadLogs"
          />
          <input
            v-model="dateTo"
            type="date"
            class="admin-input !mt-0 w-[140px] text-xs focus:ring-2 focus:ring-haica-red focus:border-haica-red dark:bg-[#1E293B]"
            aria-label="Date de fin"
            @change="loadLogs"
          />
          <div class="relative w-full sm:max-w-[320px]">
            <input v-model="searchInput" class="admin-input !mt-0 pl-10 focus:ring-2 focus:ring-haica-red focus:border-haica-red dark:bg-[#1E293B]" placeholder="Rechercher une action..." aria-label="Rechercher dans les logs" />
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true"><i class="pi pi-search text-sm"></i></span>
          </div>
        </div>
      </div>

      <div class="data-table-wrap">
        <div v-if="loading" class="flex items-center justify-center gap-3 p-12">
          <BaseSpinner size="lg" />
          <span class="font-bold text-slate-500">Chargement des logs...</span>
        </div>
        <AlertMessage v-else-if="loadError" class="m-4" :message="loadError" />
        <EmptyState v-else-if="!logs.length" icon="pi pi-history" title="Aucun log trouvé" description="Les actions des utilisateurs apparaîtront ici." />
        <table v-else class="data-table min-w-[860px]">
          <thead>
            <tr>
              <th class="sortable-th" @click="toggleSort('action')">
                Action
                <i v-if="sortField === 'action'" :class="sortDir === 'asc' ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" class="text-[10px] mr-1"></i>
              </th>
              <th class="sortable-th" @click="toggleSort('user')">
                Utilisateur
                <i v-if="sortField === 'user'" :class="sortDir === 'asc' ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" class="text-[10px] mr-1"></i>
              </th>
              <th>Cible</th>
              <th>IP</th>
              <th class="sortable-th" @click="toggleSort('date')">
                Date
                <i v-if="sortField === 'date'" :class="sortDir === 'asc' ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" class="text-[10px] mr-1"></i>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in sortedLogs" :key="log.id" class="row-hover">
              <td class="font-bold whitespace-nowrap">{{ log.action }}</td>
              <td>{{ log.user?.name ?? 'Système' }}</td>
              <td class="text-xs">{{ log.targetType ?? '-' }}<span v-if="log.targetId" class="text-[10px] text-slate-400 ms-1">({{ log.targetId.slice(0, 8) }}...)</span></td>
              <td class="font-mono text-xs">{{ log.ip ?? '-' }}</td>
              <td class="whitespace-nowrap text-xs">{{ formatDate(log.createdAt) }}</td>
              <td>
                <button v-if="log.details" class="text-haica-red hover:underline text-xs font-bold" type="button" @click="showDetails(log)">Détails</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-4 px-3 pb-3">
          <BasePagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :page-size="pageSize"
            :total="total"
            @change="goToPage"
          />
        </div>
      </div>
    </div>
    </template>

    <BaseModal :open="detailsModalOpen" title="Détails de l'action" @close="detailsModalOpen = false">
      <pre class="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-xs leading-6 overflow-auto max-h-[400px]">{{ formattedDetails }}</pre>
      <template #footer>
        <button class="btn btn--secondary" type="button" @click="detailsModalOpen = false">Fermer</button>
      </template>
    </BaseModal>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AccessDenied from '../../components/ui/AccessDenied.vue'
import AlertMessage from '../../components/ui/AlertMessage.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import BasePagination from '../../components/ui/BasePagination.vue'
import BaseSpinner from '../../components/ui/BaseSpinner.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import { api } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { useDebounce } from '../../composables/useDebounce'
import type { AuditLog } from '../../types/admin'

const auth = useAuthStore()
const hasAccess = computed(() => auth.hasPermission('view_audit_logs'))

const logs = ref<AuditLog[]>([])
const searchInput = ref('')
const search = useDebounce(searchInput, 300)
const loading = ref(true)
const loadError = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const pageSize = ref(20)
const detailsModalOpen = ref(false)
const selectedDetails = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const sortField = ref<'action' | 'user' | 'date'>('date')
const sortDir = ref<'asc' | 'desc'>('desc')

const sortedLogs = computed(() => {
  const list = [...logs.value]
  list.sort((a, b) => {
    let cmp = 0
    if (sortField.value === 'action') cmp = a.action.localeCompare(b.action)
    else if (sortField.value === 'user') cmp = (a.user?.name ?? '').localeCompare(b.user?.name ?? '')
    else if (sortField.value === 'date') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    return sortDir.value === 'asc' ? cmp : -cmp
  })
  return list
})

function toggleSort(field: 'action' | 'user' | 'date') {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDir.value = 'asc'
  }
}

watch(search, () => { currentPage.value = 1; loadLogs() })

const formattedDetails = computed(() => {
  try { return JSON.stringify(JSON.parse(selectedDetails.value), null, 2) }
  catch { return selectedDetails.value }
})

function formatDate(value: string) {
  const d = new Date(value)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function showDetails(log: AuditLog) {
  selectedDetails.value = log.details ?? '{}'
  detailsModalOpen.value = true
}

async function loadLogs() {
  loading.value = true; loadError.value = ''
  const q = new URLSearchParams({ page: String(currentPage.value), limit: String(pageSize.value) })
  if (search.value) q.set('search', search.value)
  if (dateFrom.value) q.set('dateFrom', dateFrom.value)
  if (dateTo.value) q.set('dateTo', dateTo.value)
  try {
    const result = await api.get<any>(`/audit?${q}`)
    logs.value = result.data; total.value = result.total; totalPages.value = result.totalPages
  } catch (err: any) { loadError.value = err.message ?? 'Impossible de charger les logs.' }
  finally { loading.value = false }
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page; loadLogs()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(loadLogs)
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
.sortable-th {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.sortable-th:hover {
  background: rgba(186, 34, 39, 0.06);
}
</style>
