<template>
  <MainLayout active="users">
    <div class="page-header">
      <h2>Utilisateurs</h2>
      <Button v-if="auth.hasPermission('users.create')" label="Ajouter" icon="pi pi-plus" @click="openCreate" />
    </div>

    <Card>
      <template #content>
        <DataTable :value="users" :loading="loading" stripedRows responsiveLayout="scroll">
          <Column header="#" style="width:60px">
            <template #body="{ index }">{{ index + 1 }}</template>
          </Column>
          <Column field="name" header="Nom" />
          <Column field="email" header="Email" />
          <Column header="Role">
            <template #body="{ data }"><Tag :value="data.role_name" /></template>
          </Column>
          <Column header="Statut">
            <template #body="{ data }">
              <Tag :value="data.status" :severity="data.status === 'ACTIVE' ? 'success' : 'warn'" />
            </template>
          </Column>
          <Column header="Actions" style="width:120px">
            <template #body="{ data }">
              <div class="actions-cell" v-if="data.id !== 1">
                <Button v-if="auth.hasPermission('users.edit')" icon="pi pi-pencil" severity="secondary" text rounded size="small" @click="edit(data)" />
                <Button v-if="auth.hasPermission('users.delete')" icon="pi pi-trash" severity="danger" text rounded size="small" @click="remove(data.id)" />
              </div>
              <span v-else class="text-sm text-color-secondary">Protege</span>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog v-model:visible="showForm" :header="form.id ? 'Modifier' : 'Ajouter'" modal :style="{ width: '450px' }">
      <div class="form-fields">
        <div class="field">
          <label>Nom</label>
          <InputText v-model="form.name" class="w-full" required />
        </div>
        <div class="field">
          <label>Email</label>
          <InputText v-model="form.email" type="email" class="w-full" required />
        </div>
        <div v-if="!form.id" class="field">
          <label>Mot de passe</label>
          <InputText v-model="form.password" type="password" class="w-full" required />
        </div>
        <div class="field">
          <label>Role</label>
          <Select v-model="form.role_id" :options="roles" optionLabel="name" optionValue="id" class="w-full" />
        </div>
        <div class="field">
          <label>Statut</label>
          <Select v-model="form.status" :options="statuses" class="w-full" :disabled="form.id === 1" />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" severity="secondary" text @click="showForm = false" />
        <Button label="Enregistrer" :loading="saving" @click="save" />
      </template>
    </Dialog>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCrud } from '../composables/useCrud'
import api from '../services/api'
import MainLayout from '../layouts/MainLayout.vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'

const auth = useAuthStore()
const roles = ref([])
const statuses = ['ACTIVE', 'SUSPENDED']

const { items: users, loading, showForm, saving, form, load, openCreate, edit, save, remove } = useCrud('users', {
  newItem: () => ({ name: '', email: '', password: '', role_id: 1, status: 'ACTIVE' }),
  confirmMessage: 'Supprimer cet utilisateur ?',
  toPayload: (f, isEdit) => isEdit
    ? { name: f.name, email: f.email, status: f.status, role_id: f.role_id }
    : { name: f.name, email: f.email, password: f.password, role_id: f.role_id },
})

onMounted(async () => {
  await load()
  const { data } = await api.get('/roles')
  roles.value = data.data || []
})
</script>
