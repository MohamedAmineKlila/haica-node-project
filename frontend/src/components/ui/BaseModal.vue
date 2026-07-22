<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="emit('close')">
      <div
        class="modal-panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @keydown.esc="emit('close')"
      >
        <header class="modal-header">
          <h2 :id="titleId" class="modal-title">{{ title }}</h2>
          <button class="modal-close" type="button" aria-label="Fermer" @click="emit('close')">
            <i class="pi pi-times"></i>
          </button>
        </header>
        <div class="modal-body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ open: boolean; title: string; titleId?: string }>(), {
  titleId: 'modal-title',
})
const emit = defineEmits<{ close: [] }>()
</script>
