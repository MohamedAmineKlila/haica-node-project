<template>
  <div class="layout-wrapper">
    <AppSidebar :active="active" />
    <div class="layout-main">
      <slot />
    </div>
  </div>
</template>

<script setup>
import AppSidebar from '../components/AppSidebar.vue'

defineProps({
  active: { type: String, default: 'dashboard' },
})
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
}
.layout-main {
  margin-left: 250px;
  flex: 1;
  padding: 30px;
}
</style>
