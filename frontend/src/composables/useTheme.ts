import { onMounted, ref } from 'vue'

const THEME_KEY = 'haica_theme'

export function useTheme() {
  const isDark = ref(false)

  function applyTheme(dark: boolean) {
    isDark.value = dark
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }

  function toggleDarkMode() {
    applyTheme(!isDark.value)
  }

  onMounted(() => {
    const stored = localStorage.getItem(THEME_KEY)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(stored === 'dark' || (!stored && prefersDark))
  })

  return { isDark, toggleDarkMode }
}
