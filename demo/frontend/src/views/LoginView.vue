<template>
  <div class="login-wrapper">
    <Card class="login-card">
      <template #title>
        <div class="login-title">
          <i class="pi pi-prime" style="font-size: 32px; color: #3b82f6;"></i>
          <h2>Haica Demo</h2>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="handleLogin">
          <div class="login-form">
            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
            <div class="field">
              <label for="email">Email</label>
              <InputText id="email" v-model="email" type="email" class="w-full" placeholder="admin@haica.tn" required />
            </div>
            <div class="field">
              <label for="password">Mot de passe</label>
              <Password id="password" v-model="password" :feedback="false" toggleMask class="w-full" inputClass="w-full" placeholder="Admin@123" required />
            </div>
            <Button type="submit" :label="loading ? 'Connexion...' : 'Se connecter'" :loading="loading" class="w-full" />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.error || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px !important;
}

.login-title {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.login-title h2 {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}
</style>
