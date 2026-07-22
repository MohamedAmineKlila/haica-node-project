<template>
  <MainLayout active="groupes">
    <h2 class="page-title">Groupes (Assignation de permissions aux roles)</h2>

    <div class="groupes-grid">
      <Card v-for="g in groupes" :key="g.id" class="groupe-card">
        <template #title>{{ g.name }}</template>
        <template #subtitle>{{ g.description }}</template>
        <template #content>
          <div class="groupe-content">
            <span class="perm-count">{{ g.permission_count }} permissions</span>
            <Button v-if="auth.hasPermission('roles.edit')" label="Modifier" icon="pi pi-pencil" severity="secondary" size="small" @click="editPerms(g)" />
          </div>
        </template>
      </Card>
    </div>

    <Dialog v-model:visible="showModal" :header="'Permissions de ' + (selectedRole?.name || '')" modal :style="{ width: '550px' }">
      <div v-if="loadingPerms" class="loading-spinner">
        <ProgressSpinner />
      </div>
      <div v-else class="perms-list">
        <div v-for="p in allPermissions" :key="p.id" class="perm-item">
          <Checkbox :inputId="'perm-' + p.id" :value="p.id" v-model="selectedPerms" />
          <label :for="'perm-' + p.id">{{ p.name }} <span class="perm-desc">- {{ p.description }}</span></label>
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" severity="secondary" text @click="showModal = false" />
        <Button label="Enregistrer" :loading="saving" @click="savePerms" />
      </template>
    </Dialog>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'primevue/usetoast'
import api from '../services/api'
import MainLayout from '../layouts/MainLayout.vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import ProgressSpinner from 'primevue/progressspinner'

const auth = useAuthStore()
const toast = useToast()

const groupes = ref([])
const allPermissions = ref([])
const showModal = ref(false)
const selectedRole = ref(null)
const selectedPerms = ref([])
const loadingPerms = ref(false)
const saving = ref(false)

async function load() {
  const { data } = await api.get('/roles/groupes')
  groupes.value = data.data || []
}

async function editPerms(g) {
  selectedRole.value = g
  showModal.value = true
  loadingPerms.value = true
  const [pRes, rpRes] = await Promise.all([
    api.get('/permissions'),
    api.get(`/roles/${g.id}/permissions`),
  ])
  allPermissions.value = pRes.data.data || []
  selectedPerms.value = (rpRes.data.data || []).map(p => p.id)
  loadingPerms.value = false
}

async function savePerms() {
  saving.value = true
  try {
    await api.put(`/roles/${selectedRole.value.id}/permissions`, { permissionIds: selectedPerms.value })
    toast.add({ severity: 'success', summary: 'Succes', life: 3000 })
    showModal.value = false
    await load()
  } catch (e) {
    toast.add({ severity: 'error', summary: e.response?.data?.error || 'Erreur', life: 3000 })
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
}
.groupes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.groupe-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.perm-count {
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
}
.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 30px;
}
.perms-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}
.perm-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.perm-desc {
  color: #94a3b8;
  font-size: 13px;
}
</style>
