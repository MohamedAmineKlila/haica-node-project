<template>
  <BaseModal :open="open" title="Comparer les rôles" @close="$emit('close')">
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Rôle 1</label>
          <select v-model="roleA" class="admin-input w-full text-xs dark:bg-[#1E293B]">
            <option value="">Choisir...</option>
            <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">Rôle 2</label>
          <select v-model="roleB" class="admin-input w-full text-xs dark:bg-[#1E293B]">
            <option value="">Choisir...</option>
            <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </div>
      </div>

      <div v-if="roleA && roleB && roleA !== roleB" class="space-y-2">
        <div class="flex items-center gap-4 text-xs mb-3">
          <span class="inline-flex items-center gap-1"><span class="h-3 w-3 rounded-full bg-emerald-500"></span> Commun</span>
          <span class="inline-flex items-center gap-1"><span class="h-3 w-3 rounded-full bg-haica-red"></span> Unique au rôle</span>
          <span class="inline-flex items-center gap-1"><span class="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700"></span> Absent</span>
        </div>

        <div v-for="perm in allPermissions" :key="perm.id" class="flex items-center gap-3 py-1.5 text-xs border-b border-slate-50 dark:border-slate-800 last:border-0">
          <span class="flex-1 font-semibold text-slate-700 dark:text-slate-200">{{ perm.name }}</span>
          <span class="w-6 text-center">
            <span v-if="hasPerm(roleAData, perm.name)" class="inline-block h-3 w-3 rounded-full" :class="hasPerm(roleBData, perm.name) ? 'bg-emerald-500' : 'bg-haica-red'"></span>
            <span v-else-if="hasPerm(roleBData, perm.name)" class="inline-block h-3 w-3 rounded-full bg-haica-red"></span>
            <span v-else class="inline-block h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700"></span>
          </span>
        </div>

        <div class="mt-3 text-xs text-slate-500">
          <strong>{{ roleAData?.name }}</strong>: {{ permCount(roleAData) }} permission(s) · 
          <strong>{{ roleBData?.name }}</strong>: {{ permCount(roleBData) }} permission(s) · 
          Commun: {{ commonCount }}
        </div>
      </div>

      <p v-else-if="roleA && roleB && roleA === roleB" class="text-sm text-slate-400 text-center py-4">
        Sélectionnez deux rôles différents pour les comparer.
      </p>
    </div>

    <template #footer>
      <button class="btn btn--secondary" type="button" @click="$emit('close')">Fermer</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseModal from './BaseModal.vue'
import type { Role } from '../../types/admin'

const props = defineProps<{ open: boolean; roles: Role[] }>()
defineEmits<{ close: [] }>()

const roleA = ref('')
const roleB = ref('')

const roleAData = computed(() => props.roles.find(r => r.id === roleA.value) ?? null)
const roleBData = computed(() => props.roles.find(r => r.id === roleB.value) ?? null)

const allPermissions = computed(() => {
  const map = new Map<string, { id: string; name: string }>()
  for (const r of props.roles) {
    for (const rp of r.permissions) {
      if (!map.has(rp.permission.name)) {
        map.set(rp.permission.name, rp.permission)
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
})

function hasPerm(role: Role | null, permName: string): boolean {
  return role?.permissions.some(rp => rp.permission.name === permName) ?? false
}

function permCount(role: Role | null): number {
  return role?.permissions.length ?? 0
}

const commonCount = computed(() => {
  if (!roleAData.value || !roleBData.value) return 0
  const setA = new Set(roleAData.value.permissions.map(rp => rp.permission.name))
  return roleBData.value.permissions.filter(rp => setA.has(rp.permission.name)).length
})
</script>
