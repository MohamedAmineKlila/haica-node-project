<template>
  <span class="spinner" :class="{ 'spinner--lg': size === 'lg' }" role="status" aria-label="Chargement"></span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'lg' }>(), { size: 'sm' })
</script>
