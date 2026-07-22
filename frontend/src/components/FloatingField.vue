<template>
  <div class="w-full">
    <label
      class="float-field"
      :class="{
        'float-field--textarea': multiline,
        'float-field--has-icon': hasLeft,
        'float-field--filled': modelValue && modelValue.length,
        'float-field--error': error,
        'float-field--success': success
      }"
    >
      <div class="relative">
        <span v-if="hasLeft" class="float-field__icon float-field__icon--left" aria-hidden="true">
          <slot name="icon-left" />
        </span>
        <textarea
          v-if="multiline"
          :class="[
            'float-field__control',
            hasLeft ? 'pl-12' : '',
            hasRight ? 'pr-12' : '',
            error ? '!border-red-500 focus:!border-red-600 focus:!shadow-[0_10px_24px_rgba(239,68,68,0.12)]' : '',
            success ? '!border-emerald-500 focus:!border-emerald-600 focus:!shadow-[0_10px_24px_rgba(16,185,129,0.12)]' : ''
          ]"
          :value="modelValue"
          :required="required"
          :autocomplete="autocomplete"
          :rows="rows"
          :maxlength="maxlength"
          placeholder=" "
          @input="emitValue"
        ></textarea>
        <span
          v-if="multiline"
          class="float-field__label"
          :class="{
            'text-red-500': error,
            'text-emerald-600': success
          }"
        >
          {{ label }}
        </span>
        <input
          v-else
          :class="[
            'float-field__control',
            hasLeft ? 'pl-12' : '',
            hasRight ? 'pr-12' : '',
            error ? '!border-red-500 focus:!border-red-600 focus:!shadow-[0_10px_24px_rgba(239,68,68,0.12)]' : '',
            success ? '!border-emerald-500 focus:!border-emerald-600 focus:!shadow-[0_10px_24px_rgba(16,185,129,0.12)]' : ''
          ]"
          :value="modelValue"
          :type="type"
          :required="required"
          :autocomplete="autocomplete"
          :maxlength="maxlength"
          placeholder=" "
          @input="emitValue"
        />
        <span
          v-if="!multiline"
          class="float-field__label"
          :class="{
            'text-red-500': error,
            'text-emerald-600': success
          }"
        >
          {{ label }}
        </span>
        <span v-if="hasRight" class="float-field__icon float-field__icon--right">
          <slot name="icon-right" />
        </span>
      </div>
    </label>
    <div class="flex items-start justify-between gap-2">
      <AlertMessage v-if="error" class="mt-1.5" variant="error" :message="error" aria-live="assertive" />
      <span v-if="showCount && maxlength" class="mt-1.5 text-xs font-medium text-slate-400 dark:text-slate-500" :class="{ 'text-haica-red': modelValue.length >= maxlength }">
        {{ modelValue.length }}/{{ maxlength }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  label: string
  type?: string
  required?: boolean
  autocomplete?: string
  multiline?: boolean
  rows?: number
  error?: string
  success?: boolean
  maxlength?: number
  showCount?: boolean
}>(), {
  type: 'text',
  required: false,
  autocomplete: undefined,
  multiline: false,
  rows: 4,
  error: '',
  success: false,
  maxlength: undefined,
  showCount: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

import { useSlots, computed } from 'vue'
import AlertMessage from './ui/AlertMessage.vue'
const slots = useSlots()
const hasLeft = computed(() => Boolean(slots['icon-left']))
const hasRight = computed(() => Boolean(slots['icon-right']))

function emitValue(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value)
}
</script>
