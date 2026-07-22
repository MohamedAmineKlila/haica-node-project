import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const sessionId = sessionStorage.getItem('sessionId')
  if (sessionId) {
    config.headers['x-session-id'] = sessionId
  }
  const method = (config.method || 'get').toLowerCase()
  if (['post', 'patch', 'put', 'delete'].includes(method)) {
    const csrfToken = sessionStorage.getItem('csrfToken')
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
