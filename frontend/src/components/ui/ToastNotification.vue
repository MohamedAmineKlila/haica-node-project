<template>
  <Teleport to="body">
    <div class="toast-container" role="status" aria-live="polite">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="[`toast--${toast.variant}`, { 'toast--closing': toast.closing }]"
        role="alert"
      >
        <i class="toast__icon" :class="iconClass(toast.variant)"></i>
        <span class="toast__message">{{ toast.message }}</span>
        <button class="toast__close" type="button" aria-label="Fermer" @click="remove(toast.id)">
          <i class="pi pi-times"></i>
        </button>
        <div class="toast__progress" :style="{ animationDuration: `${toast.duration}ms` }"></div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Toast, ToastVariant } from '../../composables/useToast'

defineProps<{ toasts: Toast[] }>()
const emit = defineEmits<{ remove: [id: number] }>()

function iconClass(variant: ToastVariant) {
  return {
    success: 'pi pi-check-circle',
    error: 'pi pi-times-circle',
    warning: 'pi pi-exclamation-triangle',
  }[variant]
}

function remove(id: number) {
  emit('remove', id)
}
</script>
