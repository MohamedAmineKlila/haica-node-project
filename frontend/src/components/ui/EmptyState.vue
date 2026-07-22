<template>
  <div class="empty-state">
    <div class="empty-state__icon" aria-hidden="true">
      <i :class="icon"></i>
    </div>
    <p class="empty-state__title">{{ title }}</p>
    <p v-if="description" class="empty-state__desc">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
}>(), {
  icon: 'pi pi-inbox',
  description: '',
})
</script>
