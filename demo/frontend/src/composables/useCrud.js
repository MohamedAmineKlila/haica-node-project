import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '../services/api'

export function useCrud(resource, options = {}) {
  const {
    toPayload = (form) => ({ ...form }),
    newItem = () => ({}),
    confirmMessage = 'Confirmer la suppression ?',
    onLoaded = null,
  } = options

  const toast = useToast()

  const items = ref([])
  const loading = ref(false)
  const showForm = ref(false)
  const saving = ref(false)
  const form = ref({})

  async function load() {
    loading.value = true
    try {
      const { data } = await api.get(`/${resource}`)
      items.value = data.data || []
      if (onLoaded) await onLoaded()
    } finally {
      loading.value = false
    }
  }

  function openCreate() {
    form.value = newItem()
    showForm.value = true
  }

  function edit(item) {
    form.value = { ...item }
    showForm.value = true
  }

  async function save() {
    saving.value = true
    try {
      const isEdit = !!form.value.id
      const payload = toPayload(form.value, isEdit)
      if (isEdit) {
        await api.patch(`/${resource}/${form.value.id}`, payload)
      } else {
        await api.post(`/${resource}`, payload)
      }
      toast.add({ severity: 'success', summary: 'Succes', life: 3000 })
      showForm.value = false
      await load()
    } catch (e) {
      toast.add({ severity: 'error', summary: e.response?.data?.error || 'Erreur', life: 3000 })
    } finally {
      saving.value = false
    }
  }

  async function remove(id) {
    if (!confirm(confirmMessage)) return
    try {
      await api.delete(`/${resource}/${id}`)
      toast.add({ severity: 'success', summary: 'Supprime', life: 3000 })
      await load()
    } catch (e) {
      toast.add({ severity: 'error', summary: e.response?.data?.error || 'Erreur', life: 3000 })
    }
  }

  return { items, loading, showForm, saving, form, load, openCreate, edit, save, remove }
}
