import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useToast } from '../composables/useToast'

describe('useToast', () => {
  const { toasts, add, remove } = useToast()

  beforeEach(() => {
    toasts.splice(0, toasts.length)
  })

  it('should add a toast with default variant', () => {
    add('Test message')
    expect(toasts.length).toBe(1)
    expect(toasts[0].message).toBe('Test message')
    expect(toasts[0].variant).toBe('success')
  })

  it('should add a toast with custom variant', () => {
    add('Error message', 'error')
    expect(toasts[0].variant).toBe('error')
  })

  it('should remove a toast by id', () => {
    add('Message')
    const id = toasts[0].id
    remove(id)
    expect(toasts.length).toBe(0)
  })
})
