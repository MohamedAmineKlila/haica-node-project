<template>
  <main class="auth-shell min-h-screen font-arabic text-black" dir="ltr">
    <section class="mx-auto grid min-h-screen max-w-content items-center gap-6 px-6 py-8 md:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]">
      <form class="auth-card min-w-0 rounded-2xl border border-white/80 bg-white/95 p-7 shadow-[0_24px_70px_rgba(15,35,55,0.14)] backdrop-blur" :class="{ 'shake': error }" @submit.prevent="submit">
        <div class="overflow-hidden">
          <p class="text-sm font-bold text-haica-red">HAICA Hub</p>
          <h2 class="mt-2 text-[26px] font-bold leading-[39px]">Connexion</h2>

          <Transition name="fade-slide" mode="out-in">
            <div :key="forgotMode ? 'forgot' : 'login'">
              <template v-if="forgotMode">
                <p class="mt-4 text-sm text-slate-600 leading-relaxed">
                  Saisissez votre email ci-dessous. Si un compte existe, vous recevrez un lien pour réinitialiser votre mot de passe.
                </p>
                <FloatingField v-model="email" label="Email" type="email" autocomplete="email" class="mt-4" required />
                <button class="btn btn--primary mt-4 h-12 w-full" type="button" :disabled="sendingReset" @click="submitForgotPassword">
                  <BaseSpinner v-if="sendingReset" />
                  Envoyer le lien
                </button>
                <button class="mt-3 block w-full text-center text-sm font-bold text-haica-red underline underline-offset-4" type="button" @click="forgotMode = false; error = ''">
                  Retour à la connexion
                </button>
              </template>
              <template v-else>
                <FloatingField v-model="email" label="Email" type="email" autocomplete="email" required>
                  <template #icon-left><i class="pi pi-envelope text-base"></i></template>
                </FloatingField>
                <p v-if="email && !isEmailValid" class="mt-2 text-sm text-haica-red">Adresse email invalide</p>
                <FloatingField v-model="password" :type="showPassword ? 'text' : 'password'" label="Mot de passe" autocomplete="current-password" required>
                  <template #icon-left><i class="pi pi-lock text-base"></i></template>
                  <template #icon-right>
                    <button class="text-slate-400 hover:text-slate-600 transition-colors" type="button" tabindex="-1" @click="showPassword = !showPassword">
                      <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="transition-transform duration-300 ease-out" :style="{ transform: showPassword ? 'rotate(360deg)' : 'rotate(0deg)' }"></i>
                    </button>
                  </template>
                </FloatingField>
                <Transition name="fade-slide">
                  <p v-if="capsLockGlobal && passwordFieldFocused" class="mt-2 flex items-center gap-1.5 text-sm text-amber-600 font-bold">
                    <i class="pi pi-exclamation-triangle"></i>
                    Verr. Maj activé
                  </p>
                </Transition>

                <div class="mt-4 flex items-center justify-between gap-3 text-sm">
                  <label class="inline-flex cursor-pointer items-center gap-2 font-bold text-[#667085]">
                    <input v-model="rememberMe" class="h-4 w-4 accent-haica-red" type="checkbox" />
                    Se souvenir de moi
                  </label>
                  <button class="font-bold text-haica-red underline underline-offset-4" type="button" @click="showForgotPassword">
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  class="btn btn--primary mt-6 h-12 w-full"
                  type="submit"
                  :disabled="auth.loading"
                >
                  <BaseSpinner v-if="auth.loading" />
                  {{ auth.loading ? 'Connexion...' : 'Se connecter' }}
                </button>
              </template>
            </div>
          </Transition>
        </div>

        <AlertMessage v-if="error" class="mt-4" :message="error" />
      </form>

      <WelcomeModal
        v-if="showWelcome"
        :user-name="auth.user?.name ?? 'Admin'"
        @close="navigateToAdmin"
      />

      <!-- Unauthorized modal -->
      <Transition name="fade-slide" mode="out-in">
        <div v-if="showUnauthorized" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="showUnauthorized = false">
          <div class="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-[#1E293B]">
            <div class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-red-100 dark:bg-red-950/30">
              <i class="pi pi-times-circle text-3xl text-haica-red"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Accès refusé</h3>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ unauthorizedMessage }}</p>
            <button
              class="mt-6 h-11 w-full rounded-xl bg-haica-red font-bold text-white transition-all hover:bg-[#8B1A1E] hover:shadow-lg"
              type="button"
              @click="showUnauthorized = false"
            >
              Retour
            </button>
          </div>
        </div>
      </Transition>

      <div class="auth-panel min-w-0 rounded-2xl p-7 text-white shadow-[0_30px_80px_rgba(13,43,79,0.24)] relative">
        <div class="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white/80">
          <span class="h-2 w-2 rounded-full bg-haica-red"></span>
          HAICA Hub
        </div>
        <h1 class="mt-6 max-w-2xl text-[28px] font-bold leading-[40px] min-h-[2em] flex items-center flex-wrap gap-2">
          {{ typedTitle }}
          <span v-if="!titleDone" class="inline-block w-[3px] h-[1.1em] bg-white/80 animate-blink align-middle"></span>
          <span class="text-base font-normal text-white/80 leading-[25.6px]">{{ typedSubtitle }}</span>
        </h1>
        <div class="mt-7 grid gap-4 md:grid-cols-3">
          <Transition name="feature-appear">
            <div v-if="typedFeatures[0]?.visible" class="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur min-h-[100px]">
              <strong class="block text-base text-white min-h-[24px]">{{ typedFeatures[0]?.title }}</strong>
              <span class="text-sm text-white/70 leading-relaxed">{{ typedFeatures[0]?.desc }}</span>
            </div>
          </Transition>
          <Transition name="feature-appear">
            <div v-if="typedFeatures[1]?.visible" class="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur min-h-[100px]">
              <strong class="block text-base text-white min-h-[24px]">{{ typedFeatures[1]?.title }}</strong>
              <span class="text-sm text-white/70 leading-relaxed">{{ typedFeatures[1]?.desc }}</span>
            </div>
          </Transition>
          <Transition name="feature-appear">
            <div v-if="typedFeatures[2]?.visible" class="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur min-h-[100px]">
              <strong class="block text-base text-white min-h-[24px]">{{ typedFeatures[2]?.title }}</strong>
              <span class="text-sm text-white/70 leading-relaxed">{{ typedFeatures[2]?.desc }}</span>
            </div>
          </Transition>
        </div>

        <div class="absolute bottom-4 right-4 opacity-50 animate-float-slow" style="animation-delay: -1s;">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M70 10 C100 10 125 35 125 60 C125 85 100 110 70 130 C40 110 15 85 15 60 C15 35 40 10 70 10 Z" 
                  stroke="#1B3A6B" stroke-width="2.5" fill="none" class="animate-pulse-slow" style="animation-duration: 4s;"/>
            <path d="M70 22 C88 22 106 42 106 60 C106 78 88 98 70 112 C52 98 34 78 34 60 C34 42 52 22 70 22 Z" 
                  stroke="#BA2227" stroke-width="2" fill="none" stroke-dasharray="8 6" class="animate-spin-slow" style="animation-duration: 20s;"/>
            <circle cx="70" cy="70" r="8" fill="#BA2227" class="animate-scale" style="animation-duration: 3s;"/>
            <line x1="70" y1="28" x2="70" y2="42" stroke="#1B3A6B" stroke-width="2.5" stroke-linecap="round" class="animate-pulse-slow" style="animation-duration: 2.5s;"/>
            <line x1="70" y1="98" x2="70" y2="112" stroke="#1B3A6B" stroke-width="2.5" stroke-linecap="round" class="animate-pulse-slow" style="animation-duration: 2.5s; animation-delay: 1.25s;"/>
          </svg>
        </div>

        <div class="absolute top-4 left-4 opacity-40 animate-float-slow" style="animation-delay: -3s;">
          <svg width="80" height="48" viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 24 Q10 12 20 24 T35 24 T50 24 T65 24 T75 24" 
                  stroke="#BA2227" stroke-width="2.5" fill="none" stroke-linecap="round" class="animate-pulse-slow" style="animation-duration: 3s;"/>
            <path d="M5 24 Q10 36 20 24 T35 24 T50 24 T65 24 T75 24" 
                  stroke="#1B3A6B" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="6 4" class="animate-pulse-slow" style="animation-duration: 3s; animation-delay: 0.5s;"/>
          </svg>
        </div>

        <div class="absolute top-4 right-4 opacity-35 animate-float-slow" style="animation-delay: -5s;">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="6" width="44" height="48" rx="2" stroke="#1B3A6B" stroke-width="2" fill="none"/>
            <line x1="8" y1="18" x2="52" y2="18" stroke="#1B3A6B" stroke-width="1.5" stroke-dasharray="4 3"/>
            <path d="M16 30 L22 36 L38 20" stroke="#BA2227" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" 
                  class="animate-scale" style="animation-duration: 2.5s; transform-origin: center;"/>
          </svg>
        </div>

        <div class="absolute top-0 left-0 w-24 h-24 opacity-25" style="pointer-events: none;">
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="24" y1="72" x2="24" y2="24" stroke="#1B3A6B" stroke-width="2" stroke-linecap="round" class="animate-pulse-slow" style="animation-duration: 4s;"/>
            <line x1="24" y1="24" x2="72" y2="24" stroke="#BA2227" stroke-width="2" stroke-linecap="round" class="animate-pulse-slow" style="animation-duration: 4s; animation-delay: 2s;"/>
          </svg>
        </div>

        <div class="absolute bottom-0 right-0 w-24 h-24 opacity-25" style="pointer-events: none;">
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="72" y1="24" x2="72" y2="72" stroke="#1B3A6B" stroke-width="2" stroke-linecap="round" class="animate-pulse-slow" style="animation-duration: 4s; animation-delay: 1s;"/>
            <line x1="72" y1="72" x2="24" y2="72" stroke="#BA2227" stroke-width="2" stroke-linecap="round" class="animate-pulse-slow" style="animation-duration: 4s; animation-delay: 3s;"/>
          </svg>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FloatingField from '../components/FloatingField.vue'
import AlertMessage from '../components/ui/AlertMessage.vue'
import BaseSpinner from '../components/ui/BaseSpinner.vue'
import WelcomeModal from '../components/ui/WelcomeModal.vue'
import { useAuthStore } from '../stores/auth'

const FULL_TITLE = 'Une plateforme claire pour les accès, les rôles et la traçabilité.'
const FULL_SUBTITLE = 'Animée, rapide et organisée pour administrer les comptes sans perdre le fil.'

const FEATURES = [
  { title: 'JWT', desc: 'Tokens sécurisés' },
  { title: 'RBAC', desc: 'Permissions par rôle' },
  { title: 'Audit', desc: 'Actions suivies' }
]

onMounted(() => {
  setTimeout(() => document.querySelector<HTMLInputElement>('.auth-card input[type="email"]')?.focus(), 100)
  document.addEventListener('keydown', onKeyEvent)
  document.addEventListener('keyup', onKeyEvent)
  document.addEventListener('focusin', onFocusIn)
  setTimeout(startTyping, 600)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyEvent)
  document.removeEventListener('keyup', onKeyEvent)
  document.removeEventListener('focusin', onFocusIn)
})

function onKeyEvent(e: KeyboardEvent) {
  capsLockGlobal.value = e.getModifierState('CapsLock')
}

function onFocusIn(e: FocusEvent) {
  const input = e.target as HTMLElement
  passwordFieldFocused.value = input.tagName === 'INPUT' && (input as HTMLInputElement).type === 'password'
}

function startTyping() {
  typedTitle.value = ''
  typedSubtitle.value = ''
  titleDone.value = false
  let i = 0
  const t1 = setInterval(() => {
    if (i < FULL_TITLE.length) {
      typedTitle.value += FULL_TITLE[i]
      i++
    } else {
      clearInterval(t1)
      titleDone.value = true
      setTimeout(() => {
        let j = 0
        const t2 = setInterval(() => {
          if (j < FULL_SUBTITLE.length) {
            typedSubtitle.value += FULL_SUBTITLE[j]
            j++
          } else {
            clearInterval(t2)
            setTimeout(startFeaturesTyping, 600)
          }
        }, 20)
      }, 400)
    }
  }, 35)
}

function startFeaturesTyping() {
  FEATURES.forEach((feature, index) => {
    const featureRef = typedFeatures.value[index]
    let charIndex = 0
    const titleText = feature.title
    const descText = feature.desc

    setTimeout(() => {
      const titleInterval = setInterval(() => {
        if (charIndex < titleText.length) {
          featureRef.title = titleText.slice(0, charIndex + 1)
          charIndex++
        } else {
          clearInterval(titleInterval)
          let descIndex = 0
          const descInterval = setInterval(() => {
            if (descIndex < descText.length) {
              featureRef.desc = descText.slice(0, descIndex + 1)
              descIndex++
            } else {
              clearInterval(descInterval)
              featureRef.visible = true
            }
          }, 18)
        }
      }, 25)
    }, index * 600)
  })
}

const REMEMBER_EMAIL_KEY = 'haica_remembered_email'
const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY)

const router = useRouter()
const auth = useAuthStore()
const email = ref(rememberedEmail ?? 'admin@haica.tn')
const password = ref('Admin@123')
const rememberMe = ref(Boolean(rememberedEmail))
const error = ref('')
const showPassword = ref(false)
const forgotMode = ref(false)
const sendingReset = ref(false)
const capsLockGlobal = ref(false)
const passwordFieldFocused = ref(false)
const showWelcome = ref(false)
const showUnauthorized = ref(false)
const unauthorizedMessage = ref('')
const typedTitle = ref('')
const typedSubtitle = ref('')
const titleDone = ref(false)
const typedFeatures = ref<Array<{ title: string; desc: string; visible: boolean }>>([
  { title: '', desc: '', visible: false },
  { title: '', desc: '', visible: false },
  { title: '', desc: '', visible: false }
])

function showForgotPassword() {
  forgotMode.value = true
  error.value = ''
}

async function submitForgotPassword() {
  if (!email.value) {
    error.value = 'Veuillez saisir une adresse email valide.'
    return
  }
  sendingReset.value = true
  error.value = ''
  await new Promise((r) => setTimeout(r, 1500))
  forgotMode.value = false
  error.value = 'Si un compte existe avec cet email, un lien de réinitialisation vous a été envoyé.'
  sendingReset.value = false
}

function updateRememberedEmail() {
  if (rememberMe.value) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email.value)
  } else {
    localStorage.removeItem(REMEMBER_EMAIL_KEY)
  }
}

async function submit() {
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    updateRememberedEmail()
    showWelcome.value = true
  } catch (err: any) {
    if (err.status === 403) {
      unauthorizedMessage.value = err.message ?? 'Accès non autorisé'
      showUnauthorized.value = true
    } else {
      error.value = err.message ?? 'Opération impossible'
    }
  }
}

function navigateToAdmin() {
  showWelcome.value = false
  router.push('/admin')
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.animate-blink {
  animation: blink 1s step-end infinite;
}

/* Shake animation on error */
.shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translateX(-3px); }
  20%, 80% { transform: translateX(6px); }
  30%, 50%, 70% { transform: translateX(-8px); }
  40%, 60% { transform: translateX(8px); }
}

/* Animated illustration in auth-panel */
@keyframes float-slow {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(2deg); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

@keyframes scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
.animate-spin-slow { animation: spin-slow 20s linear infinite; transform-origin: center; }
.animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; transform-origin: center; }
.animate-scale { animation: scale 3s ease-in-out infinite; transform-origin: center; }

.feature-appear-enter-active {
  transition: all 0.5s cubic-bezier(.36,.07,.19,.97);
}
.feature-appear-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.feature-appear-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
