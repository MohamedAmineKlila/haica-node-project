<template>
  <Teleport to="body">
    <Transition name="welcome-backdrop">
      <div v-if="visible" class="welcome-backdrop" @click="close">
        <Transition name="welcome-card" appear>
          <div v-if="visible" class="welcome-card" dir="ltr" @click.stop>
            <div class="welcome-illustration">
              <svg width="120" height="110" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Chair back -->
                <path d="M42 72 Q42 58 60 55 Q78 58 78 72" stroke="#1B3A6B" stroke-width="3" fill="none"/>
                <rect x="44" y="62" width="32" height="18" rx="4" fill="#1B3A6B" opacity="0.85"/>
                <!-- Chair seat -->
                <rect x="38" y="80" width="44" height="6" rx="3" fill="#1B3A6B"/>
                <!-- Chair legs -->
                <line x1="42" y1="86" x2="38" y2="100" stroke="#1B3A6B" stroke-width="3" stroke-linecap="round"/>
                <line x1="78" y1="86" x2="82" y2="100" stroke="#1B3A6B" stroke-width="3" stroke-linecap="round"/>
                <!-- Desk -->
                <rect x="10" y="68" width="100" height="5" rx="2.5" fill="#1B3A6B"/>
                <rect x="20" y="73" width="4" height="28" rx="2" fill="#1B3A6B" opacity="0.7"/>
                <rect x="96" y="73" width="4" height="28" rx="2" fill="#1B3A6B" opacity="0.7"/>
                <!-- Laptop screen -->
                <rect x="38" y="38" width="44" height="28" rx="3" fill="#e2e8f0" stroke="#1B3A6B" stroke-width="2.5"/>
                <rect x="42" y="42" width="36" height="20" rx="2" fill="#1B3A6B"/>
                <!-- Screen content -->
                <rect x="46" y="46" width="16" height="2" rx="1" fill="#60a5fa" opacity="0.8"/>
                <rect x="46" y="50" width="24" height="2" rx="1" fill="#94a3b8" opacity="0.6"/>
                <rect x="46" y="54" width="12" height="2" rx="1" fill="#60a5fa" opacity="0.5"/>
                <!-- Laptop base -->
                <path d="M34 66 L38 63 L82 63 L86 66 Z" fill="#1B3A6B"/>
                <!-- Person head -->
                <circle cx="60" cy="22" r="10" fill="#1B3A6B"/>
                <!-- Person body (shirt) -->
                <path d="M50 34 Q60 30 70 34 L72 52 Q60 54 48 52 Z" fill="#BA2227"/>
                <!-- Arms on desk -->
                <path d="M48 46 Q40 52 36 58" stroke="#BA2227" stroke-width="4.5" stroke-linecap="round" fill="none"/>
                <path d="M72 46 Q80 52 84 58" stroke="#BA2227" stroke-width="4.5" stroke-linecap="round" fill="none"/>
                <!-- Coffee mug -->
                <rect x="92" y="58" width="9" height="9" rx="2" fill="#BA2227" opacity="0.6"/>
                <path d="M101 60 Q105 60 105 63 Q105 66 101 66" stroke="#BA2227" stroke-width="1.5" fill="none" opacity="0.5"/>
                <!-- Steam -->
                <path d="M95 55 Q97 51 95 47" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.4" class="steam"/>
                <path d="M99 54 Q101 50 99 46" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.3" class="steam" style="animation-delay: 0.5s"/>
              </svg>
            </div>
            <h2 class="welcome-title">Bienvenue, {{ userName }}!</h2>
            <p class="welcome-subtitle">Vous êtes connecté avec succès.</p>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  userName: string
  duration?: number
}>()

const emit = defineEmits<{ close: [] }>()
const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function close() {
  visible.value = false
  setTimeout(() => emit('close'), 300)
}

onMounted(() => {
  visible.value = true
  timer = setTimeout(close, props.duration ?? 3500)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.welcome-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
}

.welcome-card {
  background: white;
  border-radius: 20px;
  padding: 48px 56px 40px;
  text-align: center;
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  max-width: 400px;
  width: 90%;
}

.welcome-illustration {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  animation: illustrationIn 0.5s ease both;
}

@keyframes illustrationIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.steam {
  animation: steamRise 2s ease-in-out infinite;
}

@keyframes steamRise {
  0%, 100% { opacity: 0; transform: translateY(0); }
  50% { opacity: 0.5; transform: translateY(-4px); }
}

.welcome-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px;
  line-height: 1.3;
}

.welcome-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* Backdrop transition */
.welcome-backdrop-enter-active {
  transition: opacity 0.3s ease;
}
.welcome-backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.welcome-backdrop-enter-from,
.welcome-backdrop-leave-to {
  opacity: 0;
}

/* Card transition */
.welcome-card-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.welcome-card-leave-active {
  transition: all 0.25s ease;
}
.welcome-card-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(20px);
}
.welcome-card-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
