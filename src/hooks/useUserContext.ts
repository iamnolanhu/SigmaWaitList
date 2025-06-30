import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../contexts/AppContext'
import { useUserProfile } from './useUserProfile'
import { useModuleActivation } from './useModuleActivation'
import { UserContextService } from '../lib/api/userContextService'

interface UseUserContextReturn {
  contextYaml: string | null
  isLoading: boolean
  error: string | null
  refreshContext: () => Promise<void>
  lastUpdated: Date | null
}

export const useUserContext = (): UseUserContextReturn => {
  const { user } = useApp()
  const { profile } = useUserProfile()
  const { modules } = useModuleActivation()
  
  const [contextYaml, setContextYaml] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Load user context
  const loadContext = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Try to get existing context first
      const existingContext = await UserContextService.getUserContext(user.id)
      
      if (existingContext) {
        setContextYaml(existingContext)
        setLastUpdated(new Date())
      } else if (profile) {
        // Generate new context if none exists
        await UserContextService.updateUserContext(user.id, profile, modules)
        const newContext = await UserContextService.getUserContext(user.id)
        if (newContext) {
          setContextYaml(newContext)
          setLastUpdated(new Date())
        }
      }
    } catch (err) {
      console.error('Error loading user context:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user context')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, profile, modules])
  
  // Refresh context (force regeneration)
  const refreshContext = useCallback(async () => {
    if (!user?.id || !profile) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Force regenerate context
      await UserContextService.updateUserContext(user.id, profile, modules)
      const newContext = await UserContextService.getUserContext(user.id)
      
      if (newContext) {
        setContextYaml(newContext)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error('Error refreshing user context:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh user context')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, profile, modules])
  
  // Load context on mount and when dependencies change
  useEffect(() => {
    loadContext()
  }, [loadContext])
  
  // Auto-refresh context when profile or modules change significantly
  useEffect(() => {
    if (!profile || !user?.id) return
    
    // Debounce updates to avoid too many refreshes
    const timer = setTimeout(() => {
      refreshContext()
    }, 5000) // Wait 5 seconds after changes
    
    return () => clearTimeout(timer)
  }, [profile?.updated_at, modules.length, refreshContext])
  
  return {
    contextYaml,
    isLoading,
    error,
    refreshContext,
    lastUpdated
  }
}

// Hook to get context for AI (includes automatic formatting)
export const useUserContextForAI = () => {
  const { contextYaml, isLoading } = useUserContext()
  
  const getAIContext = useCallback((): string => {
    if (!contextYaml) {
      return `USER_CONTEXT:
  # User context not available yet
  status: "loading"
  message: "User profile is being loaded..."
  note: "The user context system is still being set up."`
    }
    
    return contextYaml
  }, [contextYaml])
  
  return {
    getAIContext,
    isLoading,
    hasContext: !!contextYaml
  }
}