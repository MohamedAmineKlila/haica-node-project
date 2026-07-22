<template>
  <div class="alert" :class="`alert--${variant}`" role="alert">
    <i class="alert__icon" :class="iconClass" aria-hidden="true"></i>
    <span><slot>{{ message }}</slot></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'error' | 'success' | 'warning'
  message?: string
}>(), {
  variant: 'error',
  message: '',
})

const iconClass = computed(() => ({
  error: 'pi pi-times-circle',
  success: 'pi pi-check-circle',
  warning: 'pi pi-exclamation-triangle',
}[props.variant]))
</script>
