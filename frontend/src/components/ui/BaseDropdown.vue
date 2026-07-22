<template>
  <div class="dropdown" ref="root">
    <button
      class="dropdown-trigger btn btn--secondary"
      type="button"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggle"
      ref="triggerRef"
    >
      <slot name="trigger">{{ label }}</slot>
      <i class="pi pi-chevron-down text-xs transition-transform" :class="{ 'rotate-180': open }"></i>
    </button>
    <Teleport to="body">
      <div v-if="open" class="dropdown-menu" role="menu" :style="menuStyle" ref="menuRef">
        <slot />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, computed } from 'vue'

withDefaults(defineProps<{ label?: string }>(), { label: 'Actions' })

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref<Record<string, string>>({})

function toggle() {
  open.value = !open.value
  if (open.value) {
    nextTick(updateMenuPosition)
  }
}

function updateMenuPosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const menuHeight = menuRef.value?.offsetHeight ?? 200
  const spaceBelow = window.innerHeight - rect.bottom
  const openUp = spaceBelow < menuHeight + 8

  menuStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    ...(openUp
      ? { bottom: `${window.innerHeight - rect.top + 4}px` }
      : { top: `${rect.bottom + 4}px` }),
    minWidth: '180px',
    zIndex: '9999',
  }
}

function onClickOutside(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) {
    open.value = false
  }
}

function onScroll() {
  if (open.value) updateMenuPosition()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('scroll', onScroll, true)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('scroll', onScroll, true)
})
</script>
