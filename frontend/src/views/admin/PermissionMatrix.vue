<template>
  <section>
    <AccessDenied v-if="!hasAccess" />
    <template v-else>
    <div class="rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-card">
      <div class="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">Matrice des permissions</h2>
        <p class="text-sm text-slate-500">{{ roles.length }} rôle(s) × {{ permissions.length }} permission(s)</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center gap-3 p-12">
        <BaseSpinner size="lg" />
      </div>

      <AlertMessage v-else-if="loadError" :message="loadError" />

      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-xs">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700">
              <th class="py-3 px-4 text-left font-bold text-slate-600 dark:text-slate-300 sticky left-0 bg-white dark:bg-[#1E293B]">Permission</th>
              <th v-for="role in roles" :key="role.id" class="py-3 px-4 text-center font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {{ role.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="perm in permissions" :key="perm.id" class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200 sticky left-0 bg-white dark:bg-[#1E293B]">
                <div class="flex items-center gap-2">
                  <i class="pi pi-key text-[10px] text-slate-400"></i>
                  <span>{{ perm.name }}</span>
                </div>
                <span v-if="perm.description" class="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{{ perm.description }}</span>
              </td>
              <td v-for="role in roles" :key="role.id" class="py-3 px-4 text-center">
                <span v-if="hasPermission(role, perm.name)" class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <i class="pi pi-check text-xs"></i>
                </span>
                <span v-else class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600">
                  <i class="pi pi-minus text-xs"></i>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
import type { Permission, Role } from '../../types/admin'

const auth = useAuthStore()
const hasAccess = computed(() => auth.hasPermission('view_permissions'))

const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const loading = ref(true)
const loadError = ref('')

function hasPermission(role: Role, permName: string): boolean {
  return role.permissions.some(rp => rp.permission.name === permName)
}

async function loadData() {
  loading.value = true; loadError.value = ''
  try {
    const [rolesRes, permsRes] = await Promise.all([
      api.get<Role[]>('/roles'),
      api.get<Permission[]>('/permissions'),
    ])
    roles.value = rolesRes
    permissions.value = permsRes
  } catch (err: any) { loadError.value = err.message ?? 'Erreur de chargement.' }
  finally { loading.value = false }
}

onMounted(loadData)
</script>
