<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between gap-4">
    <p class="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
      {{ showing }}
    </p>
    <div class="flex items-center gap-1.5" dir="ltr">
      <button
        class="pagination-btn"
        type="button"
        :disabled="currentPage <= 1"
        aria-label="Première page"
        @click="goFirst"
      >
        <i class="pi pi-angle-double-left text-[10px]"></i>
      </button>
      <button
        class="pagination-btn"
        type="button"
        :disabled="currentPage <= 1"
        aria-label="Page précédente"
        @click="goPrev"
      >
        <i class="pi pi-chevron-left text-[10px]"></i>
      </button>

      <template v-for="page in visiblePages" :key="page">
        <button
          v-if="page === 'ellipsis'"
          class="pagination-btn pagination-btn--ellipsis"
          type="button"
          disabled
        >
          ...
        </button>
        <button
          v-else
          class="pagination-btn"
          :class="{ 'pagination-btn--active': page === currentPage }"
          type="button"
          :aria-label="`Page ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="goTo(page)"
        >
          {{ page }}
        </button>
      </template>

      <button
        class="pagination-btn"
        type="button"
        :disabled="currentPage >= totalPages"
        aria-label="Page suivante"
        @click="goNext"
      >
        <i class="pi pi-chevron-right text-[10px]"></i>
      </button>
      <button
        class="pagination-btn"
        type="button"
        :disabled="currentPage >= totalPages"
        aria-label="Dernière page"
        @click="goLast"
      >
        <i class="pi pi-angle-double-right text-[10px]"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

function goFirst() { emit('change', 1) }
function goPrev() { emit('change', props.currentPage - 1) }
function goNext() { emit('change', props.currentPage + 1) }
function goLast() { emit('change', props.totalPages) }
function goTo(page: number) { emit('change', page) }

const showing = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize + 1
  const end = Math.min(props.currentPage * props.pageSize, props.total)
  return `${start}–${end} sur ${props.total}`
})

const visiblePages = computed(() => {
  const { currentPage: current, totalPages: total } = props
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | 'ellipsis')[] = []
  pages.push(1)

  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)

  return pages
})
</script>

<style scoped>
.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.15s ease;
  cursor: pointer;
  user-select: none;
}
.pagination-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.pagination-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.pagination-btn--active {
  background: #BA2227;
  border-color: #BA2227;
  color: #ffffff;
}
.pagination-btn--active:hover {
  background: #8B1A1E;
  border-color: #8B1A1E;
}
.pagination-btn--ellipsis {
  border-color: transparent;
  background: transparent;
  cursor: default;
}
:root.dark .pagination-btn {
  background: #1E293B;
  border-color: #334155;
  color: #94a3b8;
}
:root.dark .pagination-btn:hover:not(:disabled) {
  background: #334155;
  border-color: #475569;
}
:root.dark .pagination-btn--active {
  background: #BA2227;
  border-color: #BA2227;
  color: #ffffff;
}
:root.dark .pagination-btn--active:hover {
  background: #8B1A1E;
}
:root.dark .pagination-btn--ellipsis {
  background: transparent;
  border-color: transparent;
}

@keyframes paginationFade {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.pagination-btn {
  animation: paginationFade 0.15s ease both;
}
</style>
