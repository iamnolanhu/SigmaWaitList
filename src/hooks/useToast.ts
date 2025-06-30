import { useState, useCallback } from 'react'
import { ToastType } from '../components/ui/toast'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

const DEFAULT_DURATION = 5000

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || DEFAULT_DURATION,
    }
    
    setToasts((prev) => [...prev, newToast])
    
    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((title: string, description?: string) => {
    addToast({ type: 'success', title, description })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    addToast({ type: 'error', title, description })
  }, [addToast])

  const warning = useCallback((title: string, description?: string) => {
    addToast({ type: 'warning', title, description })
  }, [addToast])

  const info = useCallback((title: string, description?: string) => {
    addToast({ type: 'info', title, description })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}

// Global toast instance for easy access
let globalToastInstance: ReturnType<typeof useToast> | null = null

export function setGlobalToast(instance: ReturnType<typeof useToast>) {
  globalToastInstance = instance
}

export function toast(type: ToastType, title: string, description?: string) {
  if (globalToastInstance) {
    globalToastInstance.addToast({ type, title, description })
  }
}

toast.success = (title: string, description?: string) => {
  toast('success', title, description)
}

toast.error = (title: string, description?: string) => {
  toast('error', title, description)
}

toast.warning = (title: string, description?: string) => {
  toast('warning', title, description)
}

toast.info = (title: string, description?: string) => {
  toast('info', title, description)
}