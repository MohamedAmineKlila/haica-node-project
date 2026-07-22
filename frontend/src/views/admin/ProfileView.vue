<template>
  <section class="max-w-2xl">
    <div class="rounded-2xl border border-[#e2e8f0]/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-6 shadow-card">
      <h2 class="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Mon profil</h2>

      <form @submit.prevent="updateProfile">
        <div class="space-y-5">
          <div class="flex items-center gap-6">
            <div class="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <img v-if="avatarPreview" :src="avatarPreview" class="h-full w-full object-cover" alt="Avatar" />
              <div v-else class="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400">{{ initials }}</div>
              <button
                v-if="avatarPreview"
                class="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all group-hover:bg-black/50"
                type="button"
                title="Supprimer l'avatar"
                @click="confirmDeleteAvatar"
              >
                <i class="pi pi-trash text-lg opacity-0 transition-opacity group-hover:opacity-100" style="color: #ef4444 !important;"></i>
              </button>
            </div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Avatar</label>
              <input ref="fileInput" type="file" accept="image/*" class="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-haica-red/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-haica-red hover:file:bg-haica-red/20" @change="onFileChange" />
            </div>
          </div>

          <FloatingField v-model="form.name" label="Nom complet" required />
          <FloatingField v-model="form.email" label="Email" type="email" required />

          <hr class="border-slate-100 dark:border-slate-800" />
          <h3 class="text-sm font-bold text-slate-600 dark:text-slate-300">Changer le mot de passe</h3>
          <FloatingField v-model="form.currentPassword" label="Mot de passe actuel" type="password" />
          <FloatingField v-model="form.newPassword" label="Nouveau mot de passe" type="password" />

          <AlertMessage v-if="error" :message="error" />
          <AlertMessage v-if="successMsg" variant="success" :message="successMsg" />

          <button class="btn btn--primary w-full" type="submit" :disabled="saving">
            <BaseSpinner v-if="saving" />
            Enregistrer
          </button>
        </div>
      </form>
    </div>

    <BaseModal :open="deleteAvatarModalOpen" title="Supprimer l'avatar" @close="deleteAvatarModalOpen = false">
      <p>Êtes-vous sûr de vouloir supprimer votre avatar ?</p>
      <template #footer>
        <button class="btn btn--secondary" type="button" @click="deleteAvatarModalOpen = false">Annuler</button>
        <button class="btn btn--primary" type="button" @click="removeAvatar">Supprimer</button>
      </template>
    </BaseModal>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import FloatingField from '../../components/FloatingField.vue'
import AlertMessage from '../../components/ui/AlertMessage.vue'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseSpinner from '../../components/ui/BaseSpinner.vue'
import { api, apiRequest, resolveAvatarUrl } from '../../services/api'

const auth = useAuthStore()
const saving = ref(false)
const error = ref('')
const successMsg = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref('')
const deleteAvatarModalOpen = ref(false)

const form = reactive({
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
})

const initials = computed(() => {
  if (!form.name) return '?'
  return form.name.split(' ').map((s) => s[0]).join('').toUpperCase().slice(0, 2)
})

onMounted(() => {
  if (auth.user) {
    form.name = auth.user.name
    form.email = auth.user.email
    if (auth.user.avatar) avatarPreview.value = resolveAvatarUrl(auth.user.avatar)
  }
})

function onFileChange() {
  const file = fileInput.value?.files?.[0]
  if (!file) return
  avatarPreview.value = URL.createObjectURL(file)
}

function confirmDeleteAvatar() {
  if (avatarPreview.value.startsWith('blob:')) {
    avatarPreview.value = ''
    if (fileInput.value) fileInput.value.value = ''
    return
  }
  deleteAvatarModalOpen.value = true
}

async function removeAvatar() {
  error.value = ''; successMsg.value = ''
  deleteAvatarModalOpen.value = false
  try {
    await apiRequest<{ avatar: null }>('/users/me/avatar', { method: 'DELETE' })
    avatarPreview.value = ''
    if (auth.user) auth.user.avatar = null
    auth.persist()
    successMsg.value = 'Avatar supprimé'
  } catch (err: any) {
    error.value = err.message ?? 'Erreur lors de la suppression'
  }
}

async function uploadAvatar(): Promise<string | null> {
  const file = fileInput.value?.files?.[0]
  if (!file) return null
  const fd = new FormData()
  fd.append('file', file)
  const result = await apiRequest<{ avatar: string }>('/users/me/avatar', { method: 'PATCH', body: fd })
  return result.avatar
}

async function updateProfile() {
  error.value = ''; successMsg.value = ''
  saving.value = true
  try {
    const payload: any = { name: form.name, email: form.email }
    if (form.currentPassword && form.newPassword) {
      payload.currentPassword = form.currentPassword
      payload.newPassword = form.newPassword
    }
    const updated = await api.patch<any>('/auth/profile', payload)
    if (fileInput.value?.files?.length) {
      const avatar = await uploadAvatar()
      if (avatar) updated.avatar = avatar
    }
    auth.user = updated
    auth.persist()
    successMsg.value = 'Profil mis à jour avec succès'
    form.currentPassword = ''
    form.newPassword = ''
  } catch (err: any) {
    error.value = err.message ?? 'Erreur lors de la mise à jour'
  } finally {
    saving.value = false
  }
}
</script>
