import React from 'react'
import { cn } from '../../lib/utils'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  onClose: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: 'border-[#6ad040] bg-[#6ad040]/10 text-[#6ad040]',
  error: 'border-red-500 bg-red-500/10 text-red-500',
  warning: 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
  info: 'border-blue-500 bg-blue-500/10 text-blue-500',
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  onClose,
}) => {
  const Icon = toastIcons[type]
  
  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border-2 backdrop-blur-md transition-all duration-300 animate-slide-in-right',
        toastStyles[type]
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <h3 className="font-['Space_Grotesk'] font-bold text-sm mb-1">
          {title}
        </h3>
        {description && (
          <p className="font-['Space_Mono'] text-xs opacity-90">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export interface ToastContainerProps {
  toasts: ToastProps[]
  onClose: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  )
}