<template>
  <section>
    <AccessDenied v-if="!hasAccess" />
    <div v-else class="grid gap-6 lg:grid-cols-[420px_1fr]">
    <div class="relative h-fit">
    <form class="rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-card hover:shadow-card-hover transition-all duration-300 h-fit" :class="{ 'pointer-events-none select-none blur-[2px] opacity-50': !canManage }" @submit.prevent="savePermission">
      <h2 class="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 text-left">Nouvelle permission</h2>
      <FloatingField v-model="form.name" label="Nom" required maxlength="100" show-count />
      <FloatingField v-model="form.category" label="Catégorie" maxlength="50" />
      <FloatingField v-model="form.description" label="Description" multiline maxlength="500" show-count />
      <p v-if="error" class="mt-4 rounded-xl border-r-4 border-haica-red bg-red-50 p-3 text-sm text-haica-red font-bold">{{ error }}</p>
      <button class="btn btn--primary mt-5 w-full" type="submit">Créer</button>
    </form>
    <div v-if="!canManage" class="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/60 dark:bg-[#1E293B]/70 backdrop-blur-sm">
      <i class="pi pi-lock text-3xl text-haica-red mb-2"></i>
      <span class="text-sm font-bold text-haica-red">Accès non autorisé</span>
    </div>
    </div>

    <div class="rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-card">
      <div class="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">Catalogue des permissions</h2>
        <div class="flex items-center gap-3">
          <RouterLink to="/admin/permission-matrix" class="btn btn--secondary text-xs whitespace-nowrap">
            <i class="pi pi-table mr-1"></i> Matrice
          </RouterLink>
          <div class="relative w-full sm:max-w-[320px]">
            <input
              v-model="searchInput"
              class="admin-input !mt-0 pl-10 focus:ring-2 focus:ring-haica-red focus:border-haica-red dark:bg-[#1E293B]"
              placeholder="Rechercher une permission..."
              aria-label="Rechercher une permission"
            />
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
              <i class="pi pi-search text-sm"></i>
            </span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center gap-3 p-12">
        <BaseSpinner size="lg" />
        <span class="font-bold text-slate-500">Chargement...</span>
      </div>
      <AlertMessage v-else-if="loadError" class="m-4" :message="loadError" />
      <EmptyState
        v-else-if="!filteredPermissions.length"
        icon="pi pi-key"
        :title="search ? 'Aucune permission ne correspond à votre recherche' : 'Aucune permission disponible'"
        :description="search ? 'Essayez d\'autres termes.' : 'Commencez par en créer une à l\'aide du formulaire.'"
      />
      <Transition v-else name="table-fade" mode="out-in">
        <div :key="search" class="data-table-wrap">
          <table class="data-table min-w-[680px]">
            <thead>
              <tr>
                <th class="sortable-th" @click="toggleSort('name')">
                  Nom
                  <i v-if="sortField === 'name'" :class="sortDir === 'asc' ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" class="text-[10px] mr-1"></i>
                </th>
                <th class="sortable-th" @click="toggleSort('category')">
                  Catégorie
                  <i v-if="sortField === 'category'" :class="sortDir === 'asc' ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" class="text-[10px] mr-1"></i>
                </th>
                <th>Description</th>
                <th class="text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="permission in sortedPermissions" :key="permission.id" class="row-hover">
                <td class="font-bold">
                  <input
                    v-if="editingPermissionId === permission.id"
                    v-model="editForm.name"
                    class="admin-input w-full text-xs dark:bg-[#1E293B] dark:border-slate-700 dark:text-white"
                    placeholder="Nom"
                  />
                  <span v-else>{{ permission.name }}</span>
                </td>
                <td>
                  <input
                    v-if="editingPermissionId === permission.id"
                    v-model="editForm.category"
                    class="admin-input w-full text-xs dark:bg-[#1E293B] dark:border-slate-700 dark:text-white"
                    placeholder="Catégorie"
                  />
                  <span v-else>{{ permission.category ?? '-' }}</span>
                </td>
                <td>
                  <input
                    v-if="editingPermissionId === permission.id"
                    v-model="editForm.description"
                    class="admin-input w-full text-xs dark:bg-[#1E293B] dark:border-slate-700 dark:text-white"
                    placeholder="Description"
                  />
                  <span v-else>{{ translatedPermissionDescription(permission) }}</span>
                </td>
                <td class="whitespace-nowrap text-center">
                  <template v-if="editingPermissionId === permission.id">
                    <button class="inline-flex items-center gap-1 text-emerald-600 hover:underline font-bold transition-colors mr-3" type="button" @click="saveEditPermission(permission.id)">
                      <i class="pi pi-check text-xs"></i> Enregistrer
                    </button>
                    <button class="inline-flex items-center gap-1 text-slate-500 hover:underline font-bold transition-colors" type="button" @click="cancelEditPermission">
                      <i class="pi pi-times text-xs"></i> Annuler
                    </button>
                  </template>
                  <template v-else-if="canManage">
                    <div class="flex items-center justify-center gap-4">
                      <button class="inline-flex items-center gap-1 text-slate-800 dark:text-white hover:underline font-bold transition-colors focus-visible:ring-2 focus-visible:ring-slate-800" type="button" @click="startEditPermission(permission)">
                        <i class="pi pi-pencil text-xs"></i> Modifier
                      </button>
                      <button class="inline-flex items-center gap-1 text-haica-red hover:underline font-bold transition-colors focus-visible:ring-2 focus-visible:ring-haica-red" type="button" @click="confirmDeletePermission(permission)">
                        Supprimer <i class="pi pi-trash text-xs"></i>
                      </button>
                    </div>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="filteredPermissions.length" class="mt-3 px-3 pb-3 text-sm font-medium text-slate-500">
            {{ filteredPermissions.length }} sur {{ permissions.length }} permission(s)
          </p>
        </div>
      </Transition>
    </div>

    <BaseModal :open="deleteModalOpen" title="Supprimer la permission" @close="deleteModalOpen = false">
      <p>Êtes-vous sûr de vouloir supprimer <strong>{{ permissionToDelete?.name }}</strong> ?</p>
      <template #footer>
        <button class="btn btn--secondary" type="button" @click="deleteModalOpen = false">Annuler</button>
        <button class="btn btn--primary" type="button" @click="removePermission">Supprimer</button>
      </template>
    </BaseModal>
  </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AccessDenied from '../../components/ui/AccessDenied.vue'
import FloatingField from '../../components/FloatingField.vue'
import AlertMessage from '../../components/ui/AlertMessage.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseSpinner from '../../components/ui/BaseSpinner.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import { api } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { useToast } from '../../composables/useToast'
import { useDebounce } from '../../composables/useDebounce'
import type { Permission } from '../../types/admin'
import { permissionDescriptionsFr } from '../../i18n/descriptions'

const auth = useAuthStore()
const hasAccess = computed(() => auth.hasPermission('view_permissions'))
const canManage = computed(() => auth.hasPermission('manage_permissions'))

const toast = useToast()

const permissions = ref<Permission[]>([])
const searchInput = ref('')
const search = useDebounce(searchInput, 300)

const sortField = ref<'name' | 'category'>('name')
const sortDir = ref<'asc' | 'desc'>('asc')

const sortedPermissions = computed(() => {
  const list = [...filteredPermissions.value]
  list.sort((a, b) => {
    let cmp = 0
    if (sortField.value === 'name') cmp = a.name.localeCompare(b.name)
    else if (sortField.value === 'category') cmp = (a.category ?? '').localeCompare(b.category ?? '')
    return sortDir.value === 'asc' ? cmp : -cmp
  })
  return list
})

function toggleSort(field: 'name' | 'category') {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDir.value = 'asc'
  }
}

const filteredPermissions = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return permissions.value
  return permissions.value.filter(
    (p) => p.name.toLowerCase().includes(q) || (p.category?.toLowerCase().includes(q)),
  )
})

function translatedPermissionDescription(permission: Permission) {
  return permissionDescriptionsFr[permission.name] ?? permission.description ?? '-'
}

const error = ref('')
const loadError = ref('')
const loading = ref(false)
const form = reactive({ name: '', category: '', description: '' })
const deleteModalOpen = ref(false)
const permissionToDelete = ref<Permission | null>(null)
const editingPermissionId = ref<string | null>(null)
const editForm = reactive({ name: '', category: '', description: '' })

async function loadPermissions() {
  loading.value = true
  loadError.value = ''
  try {
    permissions.value = await api.get<Permission[]>('/permissions')
  } catch (err: any) {
    loadError.value = err.message ?? 'Impossible de charger les permissions.'
  } finally {
    loading.value = false
  }
}

async function savePermission() {
  error.value = ''
  try {
    await api.post('/permissions', {
      name: form.name,
      category: form.category || undefined,
      description: form.description || undefined,
    })
    Object.assign(form, { name: '', category: '', description: '' })
    toast.add('Permission créée avec succès')
    await loadPermissions()
  } catch (err: any) {
    error.value = err.message ?? 'Opération impossible'
  }
}

function confirmDeletePermission(permission: Permission) {
  permissionToDelete.value = permission
  deleteModalOpen.value = true
}

async function removePermission() {
  if (!permissionToDelete.value) return
  await api.delete(`/permissions/${permissionToDelete.value.id}`)
  toast.add('Permission supprimée avec succès')
  deleteModalOpen.value = false
  permissionToDelete.value = null
  await loadPermissions()
}

function startEditPermission(permission: Permission) {
  editingPermissionId.value = permission.id
  editForm.name = permission.name
  editForm.category = permission.category ?? ''
  editForm.description = permission.description ?? ''
}

function cancelEditPermission() {
  editingPermissionId.value = null
}

async function saveEditPermission(id: string) {
  try {
    await api.patch(`/permissions/${id}`, {
      name: editForm.name,
      category: editForm.category || undefined,
      description: editForm.description || undefined,
    })
    toast.add('Permission modifiée avec succès')
    editingPermissionId.value = null
    await loadPermissions()
  } catch (err: any) {
    toast.add(err.message ?? 'Erreur lors de la modification', 'error')
  }
}

onMounted(loadPermissions)
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
