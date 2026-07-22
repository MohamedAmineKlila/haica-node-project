<template>
  <MainLayout active="dashboard">
    <h2 class="page-title">Dashboard</h2>

    <div class="stats-grid">
      <div v-for="card in statCards" :key="card.label" class="stat-card">
        <div class="stat-number" :style="{ color: card.color }">{{ card.value }}</div>
        <div class="stat-label">{{ card.label }}</div>
      </div>
    </div>

    <div class="cards-row">
      <Card class="flex-1">
        <template #title>Derniers utilisateurs</template>
        <template #content>
          <DataTable :value="recentUsers" size="small" stripedRows>
            <Column field="name" header="Nom" />
            <Column field="email" header="Email" />
            <Column header="Role">
              <template #body="{ data }">
                <Tag :value="data.role_name" />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
      <Card class="flex-1">
        <template #title>Derniers roles</template>
        <template #content>
          <DataTable :value="recentRoles" size="small" stripedRows>
            <Column field="name" header="Nom" />
            <Column field="description" header="Description" />
          </DataTable>
        </template>
      </Card>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import MainLayout from '../layouts/MainLayout.vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

const stats = ref({})
const recentUsers = ref([])
const recentRoles = ref([])

const statCards = computed(() => [
  { label: 'Utilisateurs', value: stats.value.total_users ?? '-', color: '#3b82f6' },
  { label: 'Actifs', value: stats.value.active_users ?? '-', color: '#22c55e' },
  { label: 'Suspendus', value: stats.value.suspended_users ?? '-', color: '#f59e0b' },
  { label: 'Roles', value: stats.value.total_roles ?? '-', color: '#06b6d4' },
  { label: 'Permissions', value: stats.value.total_permissions ?? '-', color: '#8b5cf6' },
  { label: 'Assignations', value: stats.value.total_assignments ?? '-', color: '#14b8a6' },
])

onMounted(async () => {
  const { data } = await api.get('/stats')
  stats.value = data.stats || {}
  recentUsers.value = data.recentUsers || []
  recentRoles.value = data.recentRoles || []
})
</script>

<style scoped>
.page-title {
  margin-bottom: 24px;
  font-size: 22px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--surface-card, #fff);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--surface-border, #e5e7eb);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
}

.stat-label {
  color: #6b7280;
  font-size: 13px;
  margin-top: 4px;
}

.cards-row {
  display: flex;
  gap: 20px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cards-row {
    flex-direction: column;
  }
}
</style>
