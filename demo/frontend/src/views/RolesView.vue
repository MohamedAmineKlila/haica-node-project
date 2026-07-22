<template>
  <MainLayout active="roles">
    <div class="page-header">
      <h2>Roles</h2>
      <Button v-if="auth.hasPermission('roles.create')" label="Ajouter" icon="pi pi-plus" @click="openCreate" />
    </div>

    <Card>
      <template #content>
        <DataTable :value="roles" :loading="loading" stripedRows responsiveLayout="scroll">
          <Column header="#" style="width:60px">
            <template #body="{ index }">{{ index + 1 }}</template>
          </Column>
          <Column field="name" header="Nom" />
          <Column field="description" header="Description" />
          <Column header="Actions" style="width:120px">
            <template #body="{ data }">
              <div class="actions-cell">
                <Button v-if="auth.hasPermission('roles.edit')" icon="pi pi-pencil" severity="secondary" text rounded size="small" @click="edit(data)" />
                <Button v-if="auth.hasPermission('roles.delete')" icon="pi pi-trash" severity="danger" text rounded size="small" @click="remove(data.id)" />
              </div>
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
          <label>Description</label>
          <Textarea v-model="form.description" class="w-full" rows="3" />
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
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCrud } from '../composables/useCrud'
import MainLayout from '../layouts/MainLayout.vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const auth = useAuthStore()

const { items: roles, loading, showForm, saving, form, load, openCreate, edit, save, remove } = useCrud('roles', {
  newItem: () => ({ name: '', description: '' }),
  confirmMessage: 'Supprimer ce role ?',
  toPayload: (f) => ({ name: f.name, description: f.description }),
})

onMounted(load)
</script>
