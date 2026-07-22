<template>
  <MainLayout active="health">
    <h2 class="page-title">Health Check</h2>

    <Card>
      <template #content>
        <div class="health-header">
          <h6>Resultats</h6>
          <Button icon="pi pi-refresh" severity="secondary" size="small" text label="Actualiser" @click="load" />
        </div>
        <div v-if="loading" class="loading-spinner">
          <ProgressSpinner />
        </div>
        <div v-else-if="issues.length === 0" class="empty-state">
          <i class="pi pi-check-circle"></i>
          <p>Aucun probleme detecte</p>
        </div>
        <DataTable v-else :value="issues" stripedRows>
          <Column header="Type">
            <template #body="{ data }">
              <Tag :value="data.severity" :severity="data.severity === 'CRITICAL' ? 'danger' : 'warn'" />
            </template>
          </Column>
          <Column field="table_name" header="Table" />
          <Column field="description" header="Description" />
        </DataTable>
      </template>
    </Card>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import MainLayout from '../layouts/MainLayout.vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

const issues = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  const { data } = await api.get('/health-check')
  issues.value = data.issues || []
  loading.value = false
}

onMounted(load)
</script>

<style scoped>
.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
}
.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.health-header h6 {
  margin: 0;
  font-weight: 600;
}
.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 40px;
}
.empty-state {
  text-align: center;
  padding: 40px;
  color: #22c55e;
}
.empty-state i {
  font-size: 48px;
}
.empty-state p {
  margin-top: 12px;
  color: #64748b;
}
</style>
