import React, { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { AuthService } from '../../lib/api/authService'
import { sessionManager } from '../../lib/supabase'

export const SessionWarningToast: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    const handleSessionWarning = (event: CustomEvent) => {
      setIsVisible(true)
      setTimeRemaining(event.detail.timeRemaining)
    }

    const handleSessionTimeout = () => {
      setIsVisible(false)
      // Redirect to login or show timeout message
      window.location.href = '/login?reason=timeout'
    }

    window.addEventListener('sessionWarning', handleSessionWarning as EventListener)
    window.addEventListener('sessionTimeout', handleSessionTimeout)

    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning as EventListener)
      window.removeEventListener('sessionTimeout', handleSessionTimeout)
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      const remaining = sessionManager.getTimeUntilTimeout()
      setTimeRemaining(remaining)
      
      if (remaining <= 0) {
        setIsVisible(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isVisible])

  const handleExtendSession = async () => {
    try {
      await AuthService.refreshSession()
      sessionManager.resetActivityTimer()
      setIsVisible(false)
    } catch (error) {
      console.error('Failed to extend session:', error)
    }
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-gray-900 border border-yellow-500/50 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white mb-1">
              Session Expiring Soon
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Your session will expire in {formatTime(timeRemaining)}. Would you like to continue?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExtendSession}
                className="px-3 py-1 bg-green-500 hover:bg-green-400 text-black text-xs font-medium rounded transition-colors"
              >
                Continue Session
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}