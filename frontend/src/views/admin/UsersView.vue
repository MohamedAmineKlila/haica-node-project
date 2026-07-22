<template>
  <section class="overflow-hidden">
    <AccessDenied v-if="!hasAccess" />
    <div v-else class="grid gap-6" :class="canCreate || editingId ? 'lg:grid-cols-[420px_1fr]' : 'lg:grid-cols-1'">
    <!-- Left form panel -->
    <div v-if="canCreate || editingId" class="relative h-fit">
      <form class="rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-card hover:shadow-card-hover transition-all duration-300 h-fit" @submit.prevent="saveUser">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 text-left">
          {{ editingId ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
        </h2>
      <div v-if="submitError" class="mb-4 rounded-xl border-r-4 border-haica-red bg-red-50 p-3 text-sm text-haica-red font-bold">
        <p v-for="(err, i) in submitErrors" :key="i">{{ err }}</p>
      </div>

      <div class="space-y-4">
        <FloatingField
          v-model="form.name"
          label="Nom complet"
          :error="nameError"
          required
          maxlength="100"
          show-count
        />

        <FloatingField
          v-model="form.email"
          label="Email"
          type="email"
          :error="emailError"
          required
          maxlength="255"
          show-count
        />

        <FloatingField
          v-model="form.password"
          label="Mot de passe"
          type="password"
          :required="!editingId"
        />

        <div class="text-right">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 text-left">Avatar</label>
        <div class="flex flex-wrap items-center gap-3">
            <img v-if="avatarPreview" :src="avatarPreview" class="h-10 w-10 rounded-full object-cover border border-slate-200" />
            <span v-else class="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-400">{{ form.name ? form.name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2) : '?' }}</span>
            <input ref="avatarInput" type="file" accept="image/*" class="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-haica-red/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-haica-red hover:file:bg-haica-red/20" @change="onAvatarChange" />
          </div>
        </div>

        <div class="text-right">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 text-left">Rôle</label>
          <select
            v-model="form.roleId"
            class="admin-input text-left focus:ring-2 focus:ring-haica-red focus:border-haica-red dark:bg-[#1E293B] dark:border-slate-700 dark:text-white"
            :disabled="rolesLoading || !roles.length"
            required
          >
            <option v-if="rolesLoading" value="">Chargement des rôles...</option>
            <option v-else-if="!roles.length" value="">Aucun rôle disponible</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
          <AlertMessage v-if="rolesError" class="mt-2" :message="rolesError" />
        </div>

        <div class="text-right">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">Statut de l'utilisateur</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="statusOpt in ['ACTIVE', 'SUSPENDED', 'BANNED']"
              :key="statusOpt"
              type="button"
              class="h-10 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-haica-red"
              :class="[
                form.status === statusOpt
                  ? (statusOpt === 'ACTIVE' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20' :
                     statusOpt === 'SUSPENDED' ? 'bg-orange-50 border-orange-500 text-orange-600 dark:bg-orange-950/20' :
                     'bg-red-50 border-red-500 text-haica-red dark:bg-red-950/20')
                  : 'bg-white dark:bg-[#1E293B] border-[#dfe5ec] dark:border-slate-700 text-[#667085] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
              @click="form.status = statusOpt as UserStatus"
            >
              <i :class="[
                'text-[10px]',
                statusOpt === 'ACTIVE' ? 'pi pi-check-circle' :
                statusOpt === 'SUSPENDED' ? 'pi pi-exclamation-triangle' :
                'pi pi-ban'
              ]"></i>
              {{ statusOpt }}
            </button>
          </div>
        </div>
      </div>

      <AlertMessage v-if="error" class="mt-4" :message="error" />

      <div class="mt-6 flex gap-3">
        <button
          class="btn btn--primary flex-1"
          type="submit"
          :disabled="usersLoading || (form.name && form.name.length < 2) || (form.email && !isEmailValid)"
        >
          <BaseSpinner v-if="usersLoading" />
          {{ editingId ? 'Enregistrer' : 'Créer' }}
        </button>
        <button v-if="editingId" class="btn btn--secondary" type="button" @click="resetForm">
          Annuler
        </button>
      </div>
    </form>
    </div>

    <!-- Right list panel -->
    <div class="rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-card">
      <div class="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">Gestion des utilisateurs</h2>
        <div class="flex items-center gap-3">
          <select
            v-model="pageSize"
            class="admin-input !mt-0 w-[100px] text-xs focus:ring-2 focus:ring-haica-red focus:border-haica-red dark:bg-[#1E293B]"
            @change="loadUsers"
          >
            <option :value="10">10 / page</option>
            <option :value="25">25 / page</option>
            <option :value="50">50 / page</option>
            <option :value="100">100 / page</option>
          </select>
          <div class="relative w-full sm:max-w-[320px]">
            <input
              v-model="searchInput"
              class="admin-input !mt-0 pl-10 focus:ring-2 focus:ring-haica-red focus:border-haica-red dark:bg-[#1E293B]"
              placeholder="Rechercher un utilisateur..."
              aria-label="Rechercher un utilisateur"
            />
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
              <i class="pi pi-search text-sm"></i>
            </span>
          </div>
          <label class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-[#1E293B] dark:text-slate-300 dark:hover:bg-slate-800">
            <i class="pi pi-upload text-[10px]"></i> Importer CSV
            <input type="file" accept=".csv" class="hidden" @change="handleCsvImport" />
          </label>
        </div>
      </div>

      <div class="data-table-wrap relative">
        <div v-if="usersLoading" class="overflow-hidden">
          <table class="data-table w-full">
            <thead>
              <tr>
                <th class="w-12 sticky-checkbox">
                  <div class="skeleton h-4 w-4 rounded"></div>
                </th>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th class="text-center">Statut</th>
                <th>Dernière connexion</th>
                <th v-if="canWrite" class="text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 5" :key="i" class="animate-pulse" :style="{ animationDelay: `${i * 80}ms` }">
                <td class="w-12 sticky-checkbox">
                  <div class="skeleton h-4 w-4 rounded"></div>
                </td>
                <td><div class="skeleton h-4 w-32 rounded"></div></td>
                <td><div class="skeleton h-4 w-48 rounded"></div></td>
                <td><div class="skeleton h-6 w-20 rounded-full"></div></td>
                <td class="text-center"><div class="skeleton h-6 w-16 rounded-full mx-auto"></div></td>
                <td><div class="skeleton h-4 w-20 rounded"></div></td>
                <td v-if="canWrite" class="text-center"><div class="skeleton h-8 w-20 rounded-lg mx-auto"></div></td>
              </tr>
            </tbody>
          </table>
        </div>

        <AlertMessage v-else-if="usersError" class="m-4" :message="usersError" />

        <EmptyState
          v-else-if="!users.length"
          icon="pi pi-users"
          title="Aucun utilisateur trouvé"
          description="Essayez d'ajuster vos filtres ou de créer un nouvel utilisateur."
        />

        <div v-else class="overflow-x-auto">
          <table class="data-table w-full">
            <thead>
              <tr>
                <th class="w-12 sticky-checkbox">
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 text-haica-red focus:ring-haica-red accent-haica-red"
                    :checked="selectedIds.size === users.length && users.length > 0"
                    @change="toggleSelectAll"
                    aria-label="Sélectionner tous les utilisateurs"
                  />
                </th>
                <th class="sortable-th" @click="toggleSort('name')">
                  Nom
                  <i v-if="sortField === 'name'" :class="sortDir === 'asc' ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" class="text-[10px] mr-1"></i>
                </th>
                <th class="sortable-th" @click="toggleSort('email')">
                  Email
                  <i v-if="sortField === 'email'" :class="sortDir === 'asc' ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" class="text-[10px] mr-1"></i>
                </th>
                <th>Rôle</th>
                <th class="text-center">Statut</th>
                <th>Dernière connexion</th>
                <th v-if="canWrite" class="text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in sortedUsers"
                :key="user.id"
                :class="{ 'bg-haica-red/5 dark:bg-haica-red/10': selectedIds.has(user.id), 'row-hover': true }"
              >
                <td class="w-12 sticky-checkbox">
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 text-haica-red focus:ring-haica-red accent-haica-red"
                    :checked="selectedIds.has(user.id)"
                    @change="toggleSelect(user.id)"
                    :aria-label="`Sélectionner ${user.name}`"
                  />
                </td>
                <td class="font-bold">{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="inline-block rounded bg-haica-navy/5 px-2.5 py-0.5 text-xs font-semibold text-haica-navy dark:bg-haica-navy/20 dark:text-white">
                    {{ user.role?.name ?? '-' }}
                  </span>
                </td>
                <td class="text-center">
                  <button
                    type="button"
                    class="transition-transform"
                    :class="(canManageStatus && user.role?.name !== 'Admin') ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-60'"
                    :title="(canManageStatus && user.role?.name !== 'Admin') ? 'Cliquez pour changer le statut' : (user.role?.name === 'Admin' ? 'Statut Admin protégé' : '')"
                    :disabled="!canManageStatus || user.role?.name === 'Admin'"
                    @click="canManageStatus && user.role?.name !== 'Admin' && cycleStatus(user)"
                  >
                    <StatusBadge :status="user.status" />
                  </button>
                </td>
                <td class="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {{ user.lastLoginAt ? formatDateShort(user.lastLoginAt) : 'Jamais' }}
                </td>
                <td v-if="canWrite" class="text-center">
                  <BaseDropdown label="Actions">
                    <button v-if="canEdit" class="dropdown-item" type="button" @click="editUser(user)">
                      <i class="pi pi-pencil"></i> Modifier
                    </button>
                    <button class="dropdown-item" type="button" @click="openActivityLog(user)">
                      <i class="pi pi-history"></i> Historique
                    </button>
                    <button v-if="(user.status === 'BANNED' || user.status === 'DELETED') && canManageStatus" class="dropdown-item" type="button" @click="restoreUser(user)">
                      <i class="pi pi-refresh"></i> Restaurer
                    </button>
                    <button v-else-if="canDelete" class="dropdown-item dropdown-item--danger" type="button" @click="confirmDelete(user)">
                      <i class="pi pi-trash"></i> Supprimer
                    </button>
                  </BaseDropdown>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4">
          <BasePagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :page-size="pageSize"
            :total="total"
            @change="goToPage"
          />
        </div>

        <!-- Batch action bar -->
        <Transition name="batch-fade">
          <div
            v-if="selectedIds.size > 0 && canWrite"
            class="batch-bar"
          >
            <span class="text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{{ selectedIds.size }} sélectionné(s)</span>
            <div class="h-5 w-px bg-slate-200 dark:bg-slate-700 shrink-0"></div>
            <button class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap" type="button" @click="batchAction('ACTIVE')">
              <i class="pi pi-check-circle"></i> Activer
            </button>
            <button class="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors whitespace-nowrap" type="button" @click="batchSuspendModalOpen = true">
              <i class="pi pi-exclamation-triangle"></i> Suspendre
            </button>
            <button class="inline-flex items-center gap-1.5 text-xs font-bold text-haica-red hover:text-red-700 transition-colors whitespace-nowrap" type="button" @click="batchDeleteModalOpen = true">
              <i class="pi pi-trash"></i> Supprimer
            </button>
            <div v-if="canEdit" class="h-5 w-px bg-slate-200 dark:bg-slate-700 shrink-0"></div>
            <div v-if="canEdit" class="flex items-center gap-2">
              <select v-model="batchRoleId" class="admin-input !mt-0 !py-1.5 w-[140px] text-xs dark:bg-[#1E293B]">
                <option value="">Changer de rôle...</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
              </select>
              <button v-if="batchRoleId" class="inline-flex items-center gap-1 text-xs font-bold text-haica-navy hover:underline" type="button" @click="confirmBatchRole">
                <i class="pi pi-check"></i> Appliquer
              </button>
            </div>
            <div class="h-5 w-px bg-slate-200 dark:bg-slate-700 shrink-0"></div>
            <button class="text-slate-400 hover:text-slate-600 transition-colors shrink-0" type="button" @click="selectedIds = new Set()" title="Désélectionner tout" aria-label="Désélectionner tout">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <BaseModal :open="deleteModalOpen" title="Supprimer l'utilisateur" @close="deleteModalOpen = false">
      <p>Êtes-vous sûr de vouloir supprimer <strong>{{ userToDelete?.name }}</strong> ? Cette action est irréversible.</p>
      <template #footer>
        <button class="btn btn--secondary" type="button" @click="deleteModalOpen = false">Annuler</button>
        <button class="btn btn--primary" type="button" @click="removeUser">Supprimer</button>
      </template>
    </BaseModal>

    <BaseModal :open="batchDeleteModalOpen" title="Suppression groupée" @close="batchDeleteModalOpen = false">
      <p>Êtes-vous sûr de vouloir supprimer <strong>{{ selectedIds.size }} utilisateur(s)</strong> ? Cette action est irréversible.</p>
      <template #footer>
        <button class="btn btn--secondary" type="button" @click="batchDeleteModalOpen = false">Annuler</button>
        <button class="btn btn--primary" type="button" @click="confirmBatchDelete">Supprimer</button>
      </template>
    </BaseModal>

    <BaseModal :open="batchSuspendModalOpen" title="Suspension groupée" @close="batchSuspendModalOpen = false">
      <p>Êtes-vous sûr de vouloir suspendre <strong>{{ selectedIds.size }} utilisateur(s)</strong> ?</p>
      <template #footer>
        <button class="btn btn--secondary" type="button" @click="batchSuspendModalOpen = false">Annuler</button>
        <button class="btn btn--primary" type="button" @click="confirmBatchSuspend">Suspendre</button>
      </template>
    </BaseModal>

    <BaseModal :open="activityLogOpen" :title="`Historique de ${activityLogUser?.name ?? ''}`" @close="activityLogOpen = false">
      <div v-if="activityLogLoading" class="flex items-center justify-center p-8">
        <BaseSpinner />
      </div>
      <div v-else-if="activityLogs.length" class="space-y-3 max-h-[400px] overflow-auto">
        <div v-for="log in activityLogs" :key="log.id" class="flex items-start gap-3 text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <span class="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{{ log.action }}</span>
          <span class="text-slate-400">{{ formatDateShort(log.createdAt) }}</span>
          <span v-if="log.ip" class="font-mono text-slate-400">{{ log.ip }}</span>
        </div>
      </div>
      <EmptyState v-else icon="pi pi-history" title="Aucune activité" description="Aucun log d'audit trouvé pour cet utilisateur." />
      <template #footer>
        <button class="btn btn--secondary" type="button" @click="activityLogOpen = false">Fermer</button>
      </template>
    </BaseModal>

    <BaseModal :open="batchRoleModalOpen" title="Changement de rôle groupé" @close="batchRoleModalOpen = false">
      <p>Changer le rôle de <strong>{{ selectedIds.size }} utilisateur(s)</strong> en <strong>{{ roles.find(r => r.id === batchRoleId)?.name }}</strong> ?</p>
      <template #footer>
        <button class="btn btn--secondary" type="button" @click="batchRoleModalOpen = false">Annuler</button>
        <button class="btn btn--primary" type="button" @click="confirmBatchRole">Appliquer</button>
      </template>
    </BaseModal>
  </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed, watch } from 'vue'
import AccessDenied from '../../components/ui/AccessDenied.vue'
import FloatingField from '../../components/FloatingField.vue'
import AlertMessage from '../../components/ui/AlertMessage.vue'
import BaseDropdown from '../../components/ui/BaseDropdown.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import BasePagination from '../../components/ui/BasePagination.vue'
import BaseSpinner from '../../components/ui/BaseSpinner.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import { api, apiRequest } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { useToast } from '../../composables/useToast'
import { useDebounce } from '../../composables/useDebounce'
import type { AuditLog, PaginatedUsers, Role, User, UserStatus } from '../../types/admin'

const auth = useAuthStore()
const hasAccess = computed(() => auth.hasPermission('view_users'))
const canCreate = computed(() => auth.hasPermission('create_user'))
const canEdit = computed(() => auth.hasPermission('edit_user'))
const canDelete = computed(() => auth.hasPermission('delete_user'))
const canManageStatus = computed(() => auth.hasPermission('manage_user_status'))
const canWrite = computed(() => canCreate.value || canEdit.value || canDelete.value || canManageStatus.value)

const toast = useToast()

const users = ref<User[]>([])
const roles = ref<Role[]>([])
const searchInput = ref('')
const search = useDebounce(searchInput, 300)
const error = ref('')
const submitError = ref('')
const usersError = ref('')
const rolesError = ref('')
const usersLoading = ref(false)
const rolesLoading = ref(false)
const editingId = ref<string | null>(null)
const deleteModalOpen = ref(false)
const userToDelete = ref<User | null>(null)
const batchDeleteModalOpen = ref(false)
const batchSuspendModalOpen = ref(false)
const batchRoleModalOpen = ref(false)
const batchRoleId = ref('')
const activityLogOpen = ref(false)
const activityLogUser = ref<User | null>(null)
const activityLogLoading = ref(false)
const activityLogs = ref<AuditLog[]>([])
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref('')
const avatarFile = ref<File | null>(null)
const form = reactive({ name: '', email: '', password: '', roleId: '', status: 'ACTIVE' as UserStatus })
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const pageSize = ref(10)
const selectedIds = ref(new Set<string>())

const sortField = ref<'name' | 'email'>('name')
const sortDir = ref<'asc' | 'desc'>('asc')

const sortedUsers = computed(() => {
  const list = [...users.value]
  list.sort((a, b) => {
    let cmp = 0
    if (sortField.value === 'name') cmp = a.name.localeCompare(b.name)
    else if (sortField.value === 'email') cmp = a.email.localeCompare(b.email)
    return sortDir.value === 'asc' ? cmp : -cmp
  })
  return list
})

function toggleSort(field: 'name' | 'email') {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDir.value = 'asc'
  }
}

const submitErrors = computed(() => {
  const errs: string[] = []
  if (submitError.value) errs.push(submitError.value)
  if (nameError.value) errs.push(nameError.value)
  if (emailError.value) errs.push(emailError.value)
  return errs
})

watch(search, () => {
  currentPage.value = 1
  loadUsers()
})


const isEmailValid = computed(() => {
  const v = String(form.email || '').trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
})

const nameError = computed(() => {
  if (form.name && form.name.length < 2) return 'Le nom doit comporter au moins 2 caractères'
  return ''
})

const emailError = computed(() => {
  if (form.email && !isEmailValid.value) return 'Adresse email invalide (ex: exemple@haica.tn)'
  return ''
})

async function loadUsers() {
  const query = new URLSearchParams({ page: String(currentPage.value), limit: String(pageSize.value) })
  if (search.value) query.set('search', search.value)
  usersLoading.value = true
  usersError.value = ''
  try {
    const result = await api.get<PaginatedUsers>(`/users?${query}`)
    users.value = result.data
    total.value = result.total
    totalPages.value = result.totalPages
  } catch (err: any) {
    usersError.value = err.message ?? 'Impossible de charger les utilisateurs.'
  } finally {
    usersLoading.value = false
  }
}

function onAvatarChange() {
  const file = avatarInput.value?.files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadUsers()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function toggleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  const next = new Set(selectedIds.value)
  users.value.forEach((u) => {
    if (checked) next.add(u.id)
    else next.delete(u.id)
  })
  selectedIds.value = next
}

function toggleSelect(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

async function cycleStatus(user: User) {
  const next: Record<UserStatus, UserStatus> = { ACTIVE: 'SUSPENDED', SUSPENDED: 'BANNED', BANNED: 'ACTIVE', DELETED: 'ACTIVE' }
  const newStatus = next[user.status]
  try {
    await api.patch(`/users/${user.id}`, { status: newStatus })
    user.status = newStatus
    toast.add(`Statut changé en ${newStatus}`)
  } catch (err: any) {
    toast.add(err.message ?? 'Erreur lors du changement de statut', 'error')
  }
}

async function batchAction(status: UserStatus) {
  const ids = Array.from(selectedIds.value)
  try {
    await Promise.all(ids.map((id) => api.patch(`/users/${id}`, { status })))
    toast.add(`${ids.length} utilisateur(s) mis à jour`)
    selectedIds.value = new Set()
    await loadUsers()
  } catch (err: any) {
    toast.add(err.message ?? 'Erreur lors de l\'action groupée', 'error')
  }
}

async function confirmBatchDelete() {
  batchDeleteModalOpen.value = false
  const ids = Array.from(selectedIds.value)
  try {
    await Promise.all(ids.map((id) => api.delete(`/users/${id}`)))
    toast.add(`${ids.length} utilisateur(s) supprimé(s)`)
    selectedIds.value = new Set()
    await loadUsers()
  } catch (err: any) {
    toast.add(err.message ?? 'Erreur lors de la suppression groupée', 'error')
  }
}

async function confirmBatchSuspend() {
  batchSuspendModalOpen.value = false
  const ids = Array.from(selectedIds.value)
  try {
    await Promise.all(ids.map((id) => api.patch(`/users/${id}`, { status: 'SUSPENDED' })))
    toast.add(`${ids.length} utilisateur(s) suspendu(s)`)
    selectedIds.value = new Set()
    await loadUsers()
  } catch (err: any) {
    toast.add(err.message ?? 'Erreur lors de la suspension groupée', 'error')
  }
}

async function loadRoles() {
  rolesLoading.value = true
  rolesError.value = ''
  try {
    roles.value = await api.get<Role[]>('/roles')
    if (!editingId.value && !form.roleId && roles.value.length) {
      form.roleId = roles.value[0].id
    }
  } catch (err: any) {
    rolesError.value = err.message ?? 'Impossible de charger les rôles.'
  } finally {
    rolesLoading.value = false
  }
}

function resetForm() {
  editingId.value = null
  submitError.value = ''
  Object.assign(form, {
    name: '',
    email: '',
    password: '',
    roleId: roles.value[0]?.id ?? '',
    status: 'ACTIVE',
  })
  avatarPreview.value = ''
  avatarFile.value = null
  if (avatarInput.value) avatarInput.value.value = ''
}

function editUser(user: User) {
  editingId.value = user.id
  submitError.value = ''
  Object.assign(form, {
    name: user.name,
    email: user.email,
    password: '',
    roleId: user.roleId ?? '',
    status: user.status,
  })
  avatarPreview.value = user.avatar ?? ''
  avatarFile.value = null
  if (avatarInput.value) avatarInput.value.value = ''
}

async function saveUser() {
  error.value = ''
  submitError.value = ''

  const fieldErrors: string[] = []
  if (!form.name || form.name.length < 2) fieldErrors.push('Le nom doit comporter au moins 2 caractères')
  if (form.email && !isEmailValid.value) fieldErrors.push('Adresse email invalide')
  if (!form.email) fieldErrors.push('L\'email est requis')
  if (!editingId.value && !form.password) fieldErrors.push('Le mot de passe est requis')
  if (fieldErrors.length) {
    submitError.value = fieldErrors[0]
    return
  }

  const payload: any = { name: form.name, email: form.email, roleId: form.roleId || null, status: form.status }
  if (form.password) payload.password = form.password
  try {
    let userId: string
    if (editingId.value) {
      await api.patch(`/users/${editingId.value}`, payload)
      userId = editingId.value
      toast.add('Utilisateur modifié avec succès')
    } else {
      const created = await api.post<any>('/users', { ...payload, password: form.password })
      userId = created.id
      toast.add('Utilisateur créé avec succès')
    }
    if (avatarFile.value) {
      const fd = new FormData()
      fd.append('file', avatarFile.value)
      await apiRequest(`/users/${userId}/avatar`, { method: 'PATCH', body: fd })
    }
    resetForm()
    await loadUsers()
  } catch (err: any) {
    error.value = err.message ?? 'Opération impossible'
  }
}

function confirmDelete(user: User) {
  userToDelete.value = user
  deleteModalOpen.value = true
}

async function removeUser() {
  if (!userToDelete.value) return
  await api.delete(`/users/${userToDelete.value.id}`)
  toast.add('Utilisateur supprimé avec succès')
  deleteModalOpen.value = false
  userToDelete.value = null
  await loadUsers()
}

async function restoreUser(user: User) {
  try {
    await api.patch(`/users/${user.id}/restore`)
    toast.add('Utilisateur restauré avec succès')
    await loadUsers()
  } catch (err: any) {
    toast.add(err.message ?? 'Erreur lors de la restauration', 'error')
  }
}

async function handleCsvImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const text = await file.text()
  const lines = text.split('\n').filter((line) => line.trim())
  if (lines.length < 2) {
    toast.add('Le fichier CSV est vide ou ne contient pas de données', 'error')
    return
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const nameIdx = headers.findIndex((h) => h === 'name' || h === 'nom')
  const emailIdx = headers.findIndex((h) => h === 'email' || h === 'adresse email')
  const passwordIdx = headers.findIndex((h) => h === 'password' || h === 'mot de passe')
  const roleIdx = headers.findIndex((h) => h === 'role' || h === 'roleid')

  if (nameIdx === -1 || emailIdx === -1 || passwordIdx === -1) {
    toast.add('Le CSV doit contenir les colonnes: name, email, password', 'error')
    return
  }

  const users = lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim())
    const roleId = roleIdx !== -1 ? cols[roleIdx] : undefined
    const roleObj = roleId ? roles.value.find((r) => r.name.toLowerCase() === roleId?.toLowerCase() || r.id === roleId) : undefined
    return {
      name: cols[nameIdx] ?? '',
      email: cols[emailIdx] ?? '',
      password: cols[passwordIdx] ?? '',
      roleId: roleObj?.id,
    }
  }).filter((u) => u.name && u.email && u.password)

  if (!users.length) {
    toast.add('Aucun utilisateur valide trouvé dans le CSV', 'error')
    return
  }

  try {
    const result = await api.post<{ created: number; failed: number; errors: string[] }>('/users/bulk-import', { users })
    toast.add(`${result.created} utilisateur(s) importé(s)${result.failed ? `, ${result.failed} échoué(s)` : ''}`)
    if (result.errors.length) {
      toast.add(result.errors.slice(0, 3).join('; '), 'warning')
    }
    await loadUsers()
  } catch (err: any) {
    toast.add(err.message ?? 'Erreur lors de l\'import', 'error')
  }

  // Reset file input
  ;(e.target as HTMLInputElement).value = ''
}

async function openActivityLog(user: User) {
  activityLogUser.value = user
  activityLogOpen.value = true
  activityLogLoading.value = true
  try {
    const result = await api.get<any>(`/audit?targetId=${user.id}&limit=50`)
    activityLogs.value = result.data
  } catch { activityLogs.value = [] }
  finally { activityLogLoading.value = false }
}

async function confirmBatchRole() {
  batchRoleModalOpen.value = false
  const ids = Array.from(selectedIds.value)
  try {
    await api.post('/users/bulk-role', { userIds: ids, roleId: batchRoleId.value })
    toast.add(`Rôle changé pour ${ids.length} utilisateur(s)`)
    selectedIds.value = new Set()
    batchRoleId.value = ''
    await loadUsers()
  } catch (err: any) {
    toast.add(err.message ?? 'Erreur lors du changement de rôle', 'error')
  }
}

function formatDateShort(value: string) {
  const d = new Date(value)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  await Promise.allSettled([loadRoles(), loadUsers()])
})
</script>

<style scoped>
.batch-fade-enter-active,
.batch-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.batch-fade-enter-from,
.batch-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
.batch-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 12px 20px;
  box-shadow: 0 -4px 24px rgba(15,35,55,0.12);
  direction: ltr;
}
:root.dark .batch-bar {
  border-top-color: #334155;
  background: #1E293B;
}
@media (min-width: 640px) {
  .batch-bar {
    bottom: 24px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 12px 20px;
    box-shadow: 0 12px 40px rgba(15,35,55,0.15);
  }
  :root.dark .batch-bar {
    border-color: #334155;
  }
}
.sortable-th {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.sortable-th:hover {
  background: rgba(186, 34, 39, 0.06);
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
