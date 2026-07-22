<template>
  <span class="status-badge" :class="badgeClass">
    <i :class="iconClass" class="text-[10px]" aria-hidden="true"></i>
    <span>{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | string
}>()

const config: Record<string, { class: string; icon: string; label: string }> = {
  ACTIVE: { class: 'status-badge--active', icon: 'pi pi-check-circle', label: 'ACTIVE' },
  SUSPENDED: { class: 'status-badge--suspended', icon: 'pi pi-exclamation-triangle', label: 'SUSPENDED' },
  BANNED: { class: 'status-badge--banned', icon: 'pi pi-ban', label: 'BANNED' },
  DELETED: { class: 'status-badge--deleted', icon: 'pi pi-trash', label: 'DELETED' },
}

const badgeClass = computed(() => config[props.status]?.class ?? 'status-badge--active')
const iconClass = computed(() => config[props.status]?.icon ?? 'pi pi-info-circle')
const label = computed(() => config[props.status]?.label ?? props.status)
</script>
