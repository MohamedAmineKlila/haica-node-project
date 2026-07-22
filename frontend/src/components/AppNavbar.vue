<template>
  <nav class="bg-[#666666] dark:bg-[#2a2c45] shadow-nav transition-colors" style="height: 65px;">
    <div class="max-w-content mx-auto px-6 h-full flex items-center justify-between">

      <!-- Logo -->
      <div class="flex items-center gap-3">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white shadow-sm">
          <i class="pi pi-shield text-xl"></i>
        </span>
      </div>

      <!-- Desktop nav items (left side in RTL) -->
      <div class="hidden md:flex items-center h-full">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          class="text-white dark:text-white text-base px-6 h-full flex items-center no-underline font-normal
                 hover:bg-[#777777] dark:hover:bg-[#3a3c5a] transition-colors duration-150"
          :class="item.active ? 'border-b-2 border-haica-red' : ''"
        >
          {{ item.label }}
        </a>
      </div>

      <!-- Dark Mode Toggle + User initials + name (desktop) -->
      <div class="hidden md:flex items-center gap-4">
        <button
          class="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white dark:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white"
          type="button"
          aria-label="Changer de thème"
          @click="toggleDarkMode"
        >
          <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" class="text-base"></i>
        </button>

        <div v-if="auth.isAuthenticated" class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-white text-[#333] flex items-center justify-center font-bold shadow-sm">{{ initials }}</div>
          <div class="hidden lg:flex flex-col text-white dark:text-white text-sm leading-tight text-right">
            <span class="font-bold text-white dark:text-white">{{ auth.user?.name }}</span>
            <span class="text-white/70 dark:text-white/70 text-xs">{{ roleName }}</span>
          </div>
        </div>
      </div>

      <!-- Mobile hamburger button -->
      <button
        class="md:hidden flex flex-col gap-1.5 p-3 text-white dark:text-white rounded-xl hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-white min-h-[48px] min-w-[48px] items-center justify-center"
        aria-label="فتح القائمة"
        @click="mobileOpen = !mobileOpen"
      >
        <span class="block w-6 h-0.5 bg-white transition-transform" :class="{ 'rotate-45 translate-y-2': mobileOpen }"></span>
        <span class="block w-6 h-0.5 bg-white transition-opacity" :class="{ 'opacity-0': mobileOpen }"></span>
        <span class="block w-6 h-0.5 bg-white transition-transform" :class="{ '-rotate-45 -translate-y-2': mobileOpen }"></span>
      </button>
    </div>

    <!-- Mobile drawer (stacks below navbar) -->
    <div
      v-if="mobileOpen"
      class="md:hidden bg-[#555555] dark:bg-[#1f2230] flex flex-col p-4 gap-2 border-t border-white/10 shadow-lg animate-[authIn_300ms_ease]"
    >
      <a
        v-for="item in navItems"
        :key="item.label"
        :href="item.href"
        class="text-white dark:text-white text-base py-3 px-4 rounded-xl no-underline font-normal hover:bg-white/10 transition-colors"
      >
        {{ item.label }}
      </a>
      <div class="border-t border-white/10 pt-3 flex justify-between items-center px-4">
        <span class="text-white/80 dark:text-white/80 text-sm font-bold">Mode sombre</span>
        <button
          class="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 text-white dark:text-white hover:bg-white/20 transition-colors min-h-[48px]"
          type="button"
          @click="toggleDarkMode"
        >
          <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" class="text-base"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const mobileOpen = ref(false)
const isDark = ref(false)

function toggleDarkMode() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('haica_theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('haica_theme', 'light')
  }
}

onMounted(() => {
  isDark.value = localStorage.getItem('haica_theme') === 'dark' || 
                 (!localStorage.getItem('haica_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

// Navigation items (Arabic, RTL order)
const navItems = [
  { label: 'الرئيسية',          href: '#',  active: true  },
  { label: 'عن الهيئة',         href: '#',  active: false },
  { label: 'القرارات والتراخيص', href: '#',  active: false },
  { label: 'البلاغات',           href: '#',  active: false },
  { label: 'اتصل بنا',          href: '#',  active: false },
]

const auth = useAuthStore()

const initials = computed(() => {
  const name = auth.user?.name ?? ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? ''
  return (first + last).toUpperCase()
})

const roleName = computed(() => auth.user?.role?.name ?? 'Viewer')
</script>
