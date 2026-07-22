import { defineStore } from 'pinia'
import { api } from '../services/api'
import type { User } from '../types/admin'

type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: User
}

const ACCESS_KEY = 'haica_access_token'
const REFRESH_KEY = 'haica_refresh_token'
const USER_KEY = 'haica_user'

function readUser() {
  const stored = localStorage.getItem(USER_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as User
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem(ACCESS_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
    user: readUser(),
    loading: false,
    hydrated: Boolean(localStorage.getItem(ACCESS_KEY) && localStorage.getItem(USER_KEY)),
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken && state.user),
    permissions: (state) =>
      state.user?.role?.permissions?.map((entry) => entry.permission.name) ?? [],
  },
  actions: {
    hasPermission(permission: string) {
      return this.permissions.includes(permission)
    },
    persist() {
      if (this.accessToken) localStorage.setItem(ACCESS_KEY, this.accessToken)
      if (this.refreshToken) localStorage.setItem(REFRESH_KEY, this.refreshToken)
      if (this.user) localStorage.setItem(USER_KEY, JSON.stringify(this.user))
    },
    clear() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      this.hydrated = false
      localStorage.removeItem(ACCESS_KEY)
      localStorage.removeItem(REFRESH_KEY)
      localStorage.removeItem(USER_KEY)
    },
    async login(email: string, password: string) {
      this.loading = true
      try {
        const result = await api.post<LoginResponse>(
          '/auth/login',
          { email, password },
          { auth: false },
        )
        this.accessToken = result.accessToken
        this.refreshToken = result.refreshToken
        this.user = result.user
        this.hydrated = true
        this.persist()
      } finally {
        this.loading = false
      }
    },
    async loadMe() {
      if (!this.accessToken) return
      this.user = await api.get<User>('/auth/me')
      this.hydrated = true
      this.persist()
    },
    async logout() {
      const token = this.refreshToken
      this.clear()
      if (token) {
        try {
          await api.post('/auth/logout', { refreshToken: token }, { auth: false })
        } catch {
          // Local logout should not be blocked by a stale token.
        }
      }
    },
  },
})
