import { reactive } from 'vue'

export type ToastVariant = 'success' | 'error' | 'warning'

export interface Toast {
  id: number
  message: string
  variant: ToastVariant
  duration: number
  closing: boolean
}

const toasts = reactive<Toast[]>([])
let nextId = 0

export function useToast() {
  function add(message: string, variant: ToastVariant = 'success', duration = 4000) {
    const id = nextId++
    toasts.push({ id, message, variant, duration, closing: false })
    setTimeout(() => startClose(id), duration)
  }

  function startClose(id: number) {
    const toast = toasts.find((t) => t.id === id)
    if (toast) toast.closing = true
    setTimeout(() => remove(id), 300)
  }

  function remove(id: number) {
    const idx = toasts.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.splice(idx, 1)
  }

  return { toasts, add, remove }
}
