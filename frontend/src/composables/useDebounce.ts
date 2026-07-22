import { ref, watch, type Ref } from 'vue'

export function useDebounce(source: Ref<string>, delay = 300) {
  const debounced = ref(source.value)
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(source, (val) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { debounced.value = val }, delay)
  }, { immediate: true })

  return debounced
}
