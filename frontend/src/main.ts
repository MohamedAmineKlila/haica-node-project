import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

// Pinia — state management
app.use(createPinia())

// Vue Router
app.use(router)

// PrimeVue — unstyled mode so Tailwind controls all visual styling
app.use(PrimeVue, { unstyled: true })

app.mount('#app')
