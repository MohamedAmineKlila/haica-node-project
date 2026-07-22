import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(sessionStorage.getItem('user') || 'null'))
  const sessionId = ref(sessionStorage.getItem('sessionId') || null)
  const csrfToken = ref(sessionStorage.getItem('csrfToken') || null)

  const isAuthenticated = computed(() => !!sessionId.value && !!user.value)

  const permissions = computed(() => user.value?.permissions || [])

  function hasPermission(perm) {
    return permissions.value.includes(perm)
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    sessionId.value = data.sessionId
    user.value = data.user
    csrfToken.value = data.csrfToken
    sessionStorage.setItem('sessionId', data.sessionId)
    sessionStorage.setItem('user', JSON.stringify(data.user))
    sessionStorage.setItem('csrfToken', data.csrfToken)
    return data
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (_) {}
    sessionId.value = null
    user.value = null
    sessionStorage.clear()
  }

  async function fetchMe() {
    const { data } = await api.get('/auth/me')
    user.value = data.user
    sessionStorage.setItem('user', JSON.stringify(data.user))
    return data.user
  }

  return { user, sessionId, isAuthenticated, permissions, hasPermission, login, logout, fetchMe }
})
