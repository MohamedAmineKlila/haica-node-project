<template>
  <RouterView />
  <ToastNotification :toasts="toast.toasts" @remove="toast.remove" />
</template>

<script setup lang="ts">
import { useToast } from './composables/useToast'
import { useTheme } from './composables/useTheme'
import ToastNotification from './components/ui/ToastNotification.vue'

const toast = useToast()
useTheme()
</script>
