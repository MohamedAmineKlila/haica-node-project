<template>
  <section class="flex flex-col xl:flex-row gap-6">
    <div class="flex-1 min-w-0 rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-card">
      <div class="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-2">Sessions actives</h2>
        <div class="flex items-center gap-4">
          <button class="text-xs font-bold text-orange-600 hover:text-orange-700" type="button" @click="revokeOldModalOpen = true">
            <span class="underline underline-offset-2"><i class="pi pi-clock mr-1"></i>Révoquer les sessions > 30 jours</span>
          </button>
          <button class="text-xs font-bold text-haica-red hover:text-[#8B1A1E]" type="button" @click="revokeAllModalOpen = true">
            <span class="underline underline-offset-2"><i class="pi pi-ban mr-1"></i>Révoquer toutes les autres sessions</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center gap-3 p-12">
        <BaseSpinner size="lg" />
        <span class="font-bold text-slate-500">Chargement des sessions...</span>
      </div>

      <AlertMessage v-else-if="loadError" :message="loadError" />

      <EmptyState v-else-if="!sessions.length" icon="pi pi-clock" title="Aucune session active" description="Vous n'avez aucune session active." />

      <template v-else>
        <div class="space-y-3">
          <div v-for="session in sessions" :key="session.id" class="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <div class="flex items-center gap-3">
              <span class="grid h-10 w-10 place-items-center rounded-full" :class="deviceIconClass(session.userAgent)">
                <i :class="deviceIcon(session.userAgent)" class="text-lg"></i>
              </span>
              <div>
                <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ deviceLabel(session.userAgent) }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500">Démarrée le {{ formatDate(session.createdAt) }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500">Expire le {{ formatDate(session.expiresAt) }}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-mono">{{ session.ip ?? 'IP inconnue' }}</p>
              </div>
            </div>
            <button class="text-sm font-bold text-haica-red hover:underline transition-colors" type="button" @click="revokeSession(session.id)">Révoquer</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Login history -->
    <div class="flex-1 min-w-0 rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-card">
      <h2 class="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Historique des connexions</h2>

      <div v-if="historyLoading" class="flex items-center justify-center gap-3 p-8">
        <BaseSpinner size="lg" />
      </div>

      <EmptyState v-else-if="!loginHistory.length" icon="pi pi-history" title="Aucun historique" description="Aucune connexion enregistrée." />

      <div v-else class="space-y-2">
        <div v-for="entry in loginHistory" :key="entry.id" class="flex items-center gap-3 rounded-xl border border-slate-50 dark:border-slate-800/50 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full" :class="loginIconClass(entry)">
            <i :class="loginIcon(entry)" class="text-sm"></i>
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ loginLabel(entry) }}</p>
            <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span>{{ formatDateTime(entry.createdAt) }}</span>
              <span v-if="entry.details?.ip" class="font-mono">· {{ entry.details.ip }}</span>
            </div>
          </div>
          <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
            :class="entry.action === 'USER_LOGIN' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'">
            {{ entry.action === 'USER_LOGIN' ? 'Connexion' : 'Déconnexion' }}
          </span>
        </div>
      </div>
    </div>

    <BaseModal :open="revokeAllModalOpen" title="Révoquer toutes les sessions" @close="revokeAllModalOpen = false">
      <p>Êtes-vous sûr de vouloir révoquer toutes vos autres sessions actives ? Vous restez connecté uniquement sur cette session.</p>
      <template #footer>
        <button class="btn btn--secondary" type="button" @click="revokeAllModalOpen = false">Annuler</button>
        <button class="btn btn--primary" type="button" @click="revokeAllSessions">Révoquer tout</button>
      </template>
    </BaseModal>

    <BaseModal :open="revokeOldModalOpen" title="Révoquer les anciennes sessions" @close="revokeOldModalOpen = false">
      <p>Révoquer toutes les sessions de plus de <strong>30 jours</strong> ?</p>
      <template #footer>
        <button class="btn btn--secondary" type="button" @click="revokeOldModalOpen = false">Annuler</button>
        <button class="btn btn--primary" type="button" @click="revokeOldSessions">Révoquer</button>
      </template>
    </BaseModal>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseSpinner from '../../components/ui/BaseSpinner.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import AlertMessage from '../../components/ui/AlertMessage.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import { api } from '../../services/api'
import { useToast } from '../../composables/useToast'

interface Session {
  id: string
  createdAt: string
  expiresAt: string
  ip?: string | null
  userAgent?: string | null
}

interface AuditEntry {
  id: string
  action: string
  createdAt: string
  details?: any
}

const toast = useToast()
const sessions = ref<Session[]>([])
const loginHistory = ref<AuditEntry[]>([])
const loading = ref(true)
const historyLoading = ref(true)
const loadError = ref('')
const revokeAllModalOpen = ref(false)
const revokeOldModalOpen = ref(false)

function formatDate(value: string) {
  const d = new Date(value)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function deviceIcon(ua?: string | null) {
  if (!ua) return 'pi pi-desktop'
  const lower = ua.toLowerCase()
  if (lower.includes('mobile') || lower.includes('android')) return 'pi pi-mobile'
  if (lower.includes('tablet') || lower.includes('ipad')) return 'pi pi-table'
  if (lower.includes('firefox')) return 'pi pi-spin'
  if (lower.includes('chrome')) return 'pi pi-globe'
  return 'pi pi-desktop'
}

function deviceIconClass(ua?: string | null) {
  if (!ua) return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
  const lower = ua.toLowerCase()
  if (lower.includes('mobile') || lower.includes('android')) return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
  if (lower.includes('firefox')) return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
  if (lower.includes('chrome')) return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
  return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
}

function deviceLabel(ua?: string | null) {
  if (!ua) return 'Session inconnue'
  const lower = ua.toLowerCase()
  let browser = 'Navigateur'
  if (lower.includes('firefox')) browser = 'Firefox'
  else if (lower.includes('chrome')) browser = 'Chrome'
  else if (lower.includes('safari')) browser = 'Safari'
  else if (lower.includes('edge')) browser = 'Edge'
  let device = 'Desktop'
  if (lower.includes('mobile') || lower.includes('android')) device = 'Mobile'
  else if (lower.includes('tablet') || lower.includes('ipad')) device = 'Tablette'
  return `${browser} · ${device}`
}

async function loadSessions() {
  loading.value = true; loadError.value = ''
  try {
    sessions.value = await api.get<Session[]>('/auth/sessions')
  } catch (err: any) { loadError.value = err.message ?? 'Impossible de charger les sessions.' }
  finally { loading.value = false }
}

async function revokeSession(id: string) {
  try {
    await api.delete(`/auth/sessions/${id}`)
    sessions.value = sessions.value.filter((s) => s.id !== id)
    toast.add('Session révoquée')
  } catch (err: any) {
    toast.add(err.message ?? 'Erreur', 'error')
  }
}

async function revokeAllSessions() {
  try {
    await api.delete('/auth/sessions')
    sessions.value = sessions.value.slice(0, 1)
    revokeAllModalOpen.value = false
    toast.add('Toutes les autres sessions ont été révoquées')
  } catch (err: any) {
    toast.add(err.message ?? 'Erreur', 'error')
  }
}

async function revokeOldSessions() {
  try {
    await api.post('/auth/sessions/revoke-old', { days: 30 })
    revokeOldModalOpen.value = false
    await loadSessions()
    toast.add('Les anciennes sessions ont été révoquées')
  } catch (err: any) {
    toast.add(err.message ?? 'Erreur', 'error')
  }
}

async function loadLoginHistory() {
  historyLoading.value = true
  try {
    const res = await api.get<{ data: AuditEntry[] }>('/audit', { params: { action: 'USER_LOGIN', limit: 50 } })
    const logoutRes = await api.get<{ data: AuditEntry[] }>('/audit', { params: { action: 'USER_LOGOUT', limit: 50 } })
    const all = [...(res.data?.data ?? res.data ?? []), ...(logoutRes.data?.data ?? logoutRes.data ?? [])]
    loginHistory.value = all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20)
  } catch {
  } finally {
    historyLoading.value = false
  }
}

function formatDateTime(value: string) {
  const d = new Date(value)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function loginIcon(entry: AuditEntry) {
  if (entry.action === 'USER_LOGOUT') return 'pi pi-sign-out'
  const ua = (entry.details?.userAgent ?? '').toLowerCase()
  if (ua.includes('mobile') || ua.includes('android')) return 'pi pi-mobile'
  if (ua.includes('firefox')) return 'pi pi-spin'
  if (ua.includes('chrome')) return 'pi pi-globe'
  return 'pi pi-desktop'
}

function loginIconClass(entry: AuditEntry) {
  if (entry.action === 'USER_LOGOUT') return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
  return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
}

function loginLabel(entry: AuditEntry) {
  const ua = (entry.details?.userAgent ?? '').toLowerCase()
  let browser = 'Navigateur'
  if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('edge')) browser = 'Edge'
  let device = 'Desktop'
  if (ua.includes('mobile') || ua.includes('android')) device = 'Mobile'
  else if (ua.includes('tablet') || ua.includes('ipad')) device = 'Tablette'
  return `${browser} · ${device}`
}

onMounted(() => {
  loadSessions()
  loadLoginHistory()
})
</script>
