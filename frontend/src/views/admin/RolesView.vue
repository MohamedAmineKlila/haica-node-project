<template>
  <section>
    <AccessDenied v-if="!hasAccess" />
    <div v-else class="grid gap-6" :class="canCreate || editingId ? 'lg:grid-cols-[450px_1fr]' : 'lg:grid-cols-1'">
    <!-- Left Role Form -->
    <div v-if="canCreate || editingId" class="relative h-fit">
      <form class="rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-card hover:shadow-card-hover transition-all duration-300 h-fit" @submit.prevent="saveRole">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 text-left">
          {{ editingId ? 'Modifier le rôle' : 'Nouveau rôle' }}
        </h2>
      <div v-if="submitError" class="mb-4 rounded-xl border-r-4 border-haica-red bg-red-50 p-3 text-sm text-haica-red font-bold">{{ submitError }}</div>

      <div class="space-y-4 text-right">
        <FloatingField
          v-model="form.name"
          label="Nom du rôle"
          :error="nameError"
          required
          maxlength="50"
          show-count
        />

        <FloatingField
          v-model="form.description"
          label="Description"
          multiline
          maxlength="200"
          show-count
        />

        <div class="text-right">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">Permissions associées</label>
          <div class="mt-2 min-h-20 max-h-72 overflow-auto rounded-xl border border-slate-100 dark:border-slate-800 p-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/10">
            <div v-if="permissionsLoading" class="space-y-2.5">
              <div v-for="i in 3" :key="i" class="flex gap-2 animate-pulse">
                <div class="h-4 w-4 skeleton rounded"></div>
                <div class="h-4 w-2/3 skeleton rounded"></div>
              </div>
            </div>

            <p v-else-if="permissionsError" class="border-r-4 border-haica-red bg-red-50 p-3 text-sm text-haica-red font-bold rounded-lg text-left dark:bg-red-950/20">
              {{ permissionsError }}
            </p>

            <p v-else-if="!permissions.length" class="text-sm leading-[21px] text-slate-500 dark:text-slate-400 text-left">
              Aucune permission n'est disponible. Ajoutez d'abord des permissions.
            </p>

            <label v-for="permission in permissions" v-else :key="permission.id" class="mb-3 flex items-start gap-3 text-sm select-none cursor-pointer group text-right">
              <span class="flex-1">
                <strong class="block text-slate-800 dark:text-white group-hover:text-haica-red transition-colors">{{ permission.name }}</strong>
                <span class="text-slate-400 dark:text-slate-500 text-xs">{{ permission.category ?? 'general' }}</span>
              </span>
              <input
                v-model="form.permissionIds"
                class="mt-1 h-4 w-4 rounded border-slate-300 text-haica-red focus:ring-haica-red accent-haica-red flex-shrink-0"
                type="checkbox"
                :value="permission.id"
              />
            </label>
          </div>
        </div>
      </div>

      <p v-if="error" class="mt-4 rounded-xl border-r-4 border-haica-red bg-red-50 p-3 text-sm text-haica-red text-left font-bold dark:bg-red-950/20">{{ error }}</p>

      <div class="mt-6 flex gap-3">
        <button
          class="btn btn--primary flex-1"
          type="submit"
          :disabled="permissionsLoading || (form.name && form.name.length < 2)"
        >
          {{ editingId ? 'Enregistrer' : 'Créer' }}
        </button>
        <button
          v-if="editingId"
          class="btn btn--secondary"
          type="button"
          @click="resetForm"
        >
          Annuler
        </button>
      </div>
    </form>
    </div>

    <!-- Right list area -->
    <div class="grid gap-4">
      <!-- Search -->
      <div class="mb-5 flex items-center gap-3 justify-start" dir="ltr">
        <div class="relative w-full sm:max-w-[320px]">
          <input
            v-model="searchInput"
            class="admin-input !mt-0 pl-10 focus:ring-2 focus:ring-haica-red focus:border-haica-red dark:bg-[#1E293B]"
            placeholder="Rechercher un rôle..."
            aria-label="Rechercher un rôle"
          />
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
            <i class="pi pi-search text-sm"></i>
          </span>
        </div>
        <p class="text-sm font-medium text-slate-500 whitespace-nowrap">
          {{ filteredRoles.length }} sur {{ roles.length }} rôle(s)
        </p>
        <button v-if="canEdit" class="btn btn--secondary text-xs whitespace-nowrap" type="button" @click="comparisonOpen = true">
          <i class="pi pi-code-compare mr-1"></i> Comparer
        </button>
      </div>

      <!-- Loading Skeletons -->
      <div v-if="rolesLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 space-y-3 animate-pulse shadow-card">
          <div class="h-5 w-1/4 skeleton rounded"></div>
          <div class="h-4 w-1/2 skeleton rounded"></div>
          <div class="h-6 w-1/3 skeleton rounded-full"></div>
        </div>
      </div>

      <AlertMessage v-else-if="rolesError" :message="rolesError" />

      <EmptyState
        v-else-if="!filteredRoles.length"
        icon="pi pi-lock"
        :title="search ? 'Aucun rôle ne correspond à votre recherche' : 'Aucun rôle trouvé'"
        :description="search ? 'Essayez d\'autres termes.' : 'Commencez par en créer un à l\'aide du formulaire.'"
      />

      <TransitionGroup v-else name="role-list" tag="div" class="space-y-4">
        <article
          v-for="role in filteredRoles"
          :key="role.id"
          class="rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 text-left"
        >
          <div class="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div class="space-y-1">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i class="pi pi-lock text-haica-navy dark:text-white text-sm"></i>
                {{ role.name }}
              </h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ translatedRoleDescription(role) }}</p>
              <p class="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-2">
                <i class="pi pi-users text-[10px]"></i>
                {{ role._count?.users ?? 0 }} utilisateur(s) associé(s)
              </p>
            </div>
            <div v-if="canEdit || canDelete" class="flex gap-3 text-sm font-bold">
              <button
                v-if="canDelete"
                class="inline-flex items-center gap-1 text-haica-red hover:underline font-bold transition-colors focus-visible:ring-2 focus-visible:ring-haica-red"
                type="button"
                @click="confirmDeleteRole(role)"
              >
                Supprimer <i class="pi pi-trash text-xs"></i>
              </button>
              <button
                v-if="canEdit"
                class="inline-flex items-center gap-1 text-slate-800 dark:text-white hover:underline font-bold transition-colors focus-visible:ring-2 focus-visible:ring-slate-800"
                type="button"
                @click="editRole(role)"
              >
                Modifier <i class="pi pi-pencil text-xs"></i>
              </button>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-2 pt-4 border-t border-slate-50 dark:border-slate-800">
            <span
              v-for="entry in role.permissions"
              :key="entry.permission.id"
              class="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/60"
            >
              <i class="pi pi-key text-[9px] text-slate-400"></i>
              {{ entry.permission.name }}
            </span>
          </div>
        </article>
      </TransitionGroup>

      <BaseModal :open="deleteModalOpen" title="Supprimer le rôle" @close="deleteModalOpen = false">
        <p>Êtes-vous sûr de vouloir supprimer <strong>{{ roleToDelete?.name }}</strong> ? Les utilisateurs associés seront sans rôle.</p>
        <template #footer>
          <button class="btn btn--secondary" type="button" @click="deleteModalOpen = false">Annuler</button>
          <button class="btn btn--primary" type="button" @click="removeRole">Supprimer</button>
        </template>
      </BaseModal>

      <RoleComparison :open="comparisonOpen" :roles="roles" @close="comparisonOpen = false" />
    </div>
  </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import AccessDenied from '../../components/ui/AccessDenied.vue'
import FloatingField from '../../components/FloatingField.vue'
import AlertMessage from '../../components/ui/AlertMessage.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import RoleComparison from '../../components/ui/RoleComparison.vue'
import { api } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { useToast } from '../../composables/useToast'
import { useDebounce } from '../../composables/useDebounce'
import type { Permission, Role } from '../../types/admin'
import { roleDescriptionsFr } from '../../i18n/descriptions'

const auth = useAuthStore()
const hasAccess = computed(() => auth.hasPermission('view_roles'))
const canCreate = computed(() => auth.hasPermission('create_role'))
const canEdit = computed(() => auth.hasPermission('edit_role'))
const canDelete = computed(() => auth.hasPermission('delete_role'))

const toast = useToast()

const roles = ref<Role[]>([])
const searchInput = ref('')
const search = useDebounce(searchInput, 300)

const filteredRoles = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return roles.value
  return roles.value.filter(
    (r) => r.name.toLowerCase().includes(q) || (r.description?.toLowerCase().includes(q)),
  )
})

function translatedRoleDescription(role: Role) {
  return roleDescriptionsFr[role.name] ?? role.description ?? 'Aucune description'
}

const permissions = ref<Permission[]>([])
const editingId = ref<string | null>(null)
const error = ref('')
const submitError = ref('')
const rolesLoading = ref(false)
const permissionsLoading = ref(false)
const rolesError = ref('')
const permissionsError = ref('')
const form = reactive({ name: '', description: '', permissionIds: [] as string[] })
const deleteModalOpen = ref(false)
const roleToDelete = ref<Role | null>(null)
const comparisonOpen = ref(false)

const nameError = computed(() => {
  if (form.name && form.name.length < 2) return 'Le nom du rôle doit comporter au moins 2 caractères'
  return ''
})

async function loadAll() {
  rolesLoading.value = true
  permissionsLoading.value = true
  rolesError.value = ''
  permissionsError.value = ''

  const [roleResult, permissionResult] = await Promise.allSettled([
    api.get<Role[]>('/roles'),
    api.get<Permission[]>('/permissions'),
  ])

  if (roleResult.status === 'fulfilled') {
    roles.value = roleResult.value
  } else {
    rolesError.value = roleResult.reason?.message ?? 'Impossible de charger les rôles.'
  }

  if (permissionResult.status === 'fulfilled') {
    permissions.value = permissionResult.value
  } else {
    permissionsError.value =
      permissionResult.reason?.status === 403
        ? 'Votre rôle ne permet pas de consulter les permissions.'
        : permissionResult.reason?.message ?? 'Impossible de charger les permissions.'
  }

  rolesLoading.value = false
  permissionsLoading.value = false
}

function resetForm() {
  editingId.value = null
  submitError.value = ''
  Object.assign(form, { name: '', description: '', permissionIds: [] })
}

function editRole(role: Role) {
  editingId.value = role.id
  submitError.value = ''
  Object.assign(form, {
    name: role.name,
    description: role.description ?? '',
    permissionIds: role.permissions.map((entry) => entry.permission.id),
  })
}

async function saveRole() {
  error.value = ''
  submitError.value = ''

  if (!form.name || form.name.length < 2) {
    submitError.value = 'Le nom du rôle doit comporter au moins 2 caractères'
    return
  }

  const payload = { name: form.name, description: form.description, permissionIds: form.permissionIds }
  try {
    if (editingId.value) {
      await api.patch(`/roles/${editingId.value}`, payload)
      toast.add('Rôle modifié avec succès')
    } else {
      await api.post('/roles', payload)
      toast.add('Rôle créé avec succès')
    }
    resetForm()
    await loadAll()
  } catch (err: any) {
    error.value = err.message ?? 'Opération impossible'
  }
}

function confirmDeleteRole(role: Role) {
  roleToDelete.value = role
  deleteModalOpen.value = true
}

async function removeRole() {
  if (!roleToDelete.value) return
  await api.delete(`/roles/${roleToDelete.value.id}`)
  toast.add('Rôle supprimé avec succès')
  deleteModalOpen.value = false
  roleToDelete.value = null
  await loadAll()
}

onMounted(loadAll)
</script>

<style scoped>
.role-list-enter-active,
.role-list-leave-active {
  transition: all 0.25s ease;
}
.role-list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.role-list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.role-list-move {
  transition: transform 0.25s ease;
}
</style>
