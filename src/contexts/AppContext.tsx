import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { OptimizedAuthService } from '../lib/api/optimizedAuthService'
import { OptimizedProfileService } from '../lib/api/optimizedProfileService'
import { AppMode, ModuleProgress } from '../types/app'

interface AppContextType {
  // App mode state
  appMode: AppMode
  setAppMode: (mode: AppMode) => void
  
  // User state
  user: User | null
  userProfile: any | null
  loading: boolean
  
  // Onboarding state
  needsOnboarding: boolean
  isOnboarding: boolean
  setIsOnboarding: (onboarding: boolean) => void
  completeOnboarding: () => void
  
  // Module progress
  moduleProgress: ModuleProgress
  updateModuleProgress: (module: string, progress: Partial<ModuleProgress[string]>) => void
  
  // Auth functions
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appMode, setAppMode] = useState<AppMode>({ isAppMode: false, hasAccess: false })
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({})

  // Initialize auth state with optimized service
  useEffect(() => {
    let mounted = true
    
    // Add a timeout fallback
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('Auth initialization timeout, proceeding without auth')
        setLoading(false)
      }
    }, 5000)
    
    // Get initial session using optimized service
    OptimizedAuthService.getCurrentSession()
      .then((session) => {
        if (!mounted) return
        
        clearTimeout(timeoutId)
        
        setUser(session?.user ?? null)
        if (session?.user) {
          // Set app mode immediately for logged-in users
          setAppMode({ isAppMode: true, hasAccess: true })
          loadUserProfile(session.user.id)
        } else {
          setLoading(false)
        }
      })
      .catch((error) => {
        if (!mounted) return
        
        clearTimeout(timeoutId)
        console.error('Auth initialization error:', error)
        setUser(null)
        setLoading(false)
      })

    // Listen for auth changes using optimized service
    const unsubscribe = OptimizedAuthService.onAuthStateChange(
      async (user) => {
        if (!mounted) return
        
        try {
          setUser(user)
          if (user) {
            await loadUserProfile(user.id)
          } else {
            setUserProfile(null)
            setAppMode({ isAppMode: false, hasAccess: false })
            setLoading(false)
          }
        } catch (error) {
          console.error('Auth state change error:', error)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await OptimizedProfileService.getCompleteProfile(userId)
      
      setUserProfile(profile)
      
      // ONBOARDING DISABLED - Comment out to skip onboarding flow
      // Check if user needs onboarding
      // const profileCompletion = profile?.completion_percentage || 0
      // const hasBasicInfo = profile?.name && profile?.business_type
      
      // if (!hasBasicInfo || profileCompletion < 20) {
      //   // User needs onboarding
      //   setNeedsOnboarding(true)
      //   setIsOnboarding(true)
      //   setAppMode({ 
      //     isAppMode: false, // Don't allow app access until onboarding complete
      //     hasAccess: true 
      //   })
      // } else {
      //   // User has completed onboarding
      //   setNeedsOnboarding(false)
      //   setIsOnboarding(false)
      //   setAppMode({ 
      //     isAppMode: true, // Allow app access
      //     hasAccess: true 
      //   })
      // }
      
      // Always allow app access (onboarding disabled)
      setNeedsOnboarding(false)
      setIsOnboarding(false)
      setAppMode({ 
        isAppMode: true, 
        hasAccess: true 
      })
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setLoading(false)
    }
  }

  const updateModuleProgress = (module: string, progress: Partial<ModuleProgress[string]>) => {
    setModuleProgress(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        ...progress,
        last_updated: new Date().toISOString()
      }
    }))
  }

  const completeOnboarding = () => {
    setNeedsOnboarding(false)
    setIsOnboarding(false)
    setAppMode({ 
      isAppMode: true, 
      hasAccess: true 
    })
  }

  const signIn = async (email: string, password: string) => {
    try {
      const result = await OptimizedAuthService.signIn(email, password)
      
      if (result.error) {
        return { error: result.error }
      }

      // If signin was successful, update the user state and load profile
      if (result.user) {
        setUser(result.user)
        await loadUserProfile(result.user.id)
        // Set app mode to dashboard for immediate access
        setAppMode({ 
          isAppMode: true, 
          hasAccess: true 
        })
      }

      return { error: undefined }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { error: error.message || 'An unexpected error occurred' }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const result = await OptimizedAuthService.signUp(email, password)
      
      if (result.error) {
        return { error: result.error }
      }

      // If signup was successful and user was created, update the user state
      if (result.user) {
        setUser(result.user)
        // ONBOARDING DISABLED - Skip onboarding for new users
        // New users need onboarding
        // setNeedsOnboarding(true)
        // setIsOnboarding(true)
        // setAppMode({ 
        //   isAppMode: false, // Don't allow app access until onboarding complete
        //   hasAccess: true 
        // })
        
        // Direct access to app (onboarding disabled)
        setNeedsOnboarding(false)
        setIsOnboarding(false)
        setAppMode({ 
          isAppMode: true, 
          hasAccess: true 
        })
        setLoading(false)
      }

      return { error: undefined }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { error: error.message || 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    try {
      await OptimizedAuthService.signOut()
      
      // Reset all state
      setUser(null)
      setUserProfile(null)
      setNeedsOnboarding(false)
      setIsOnboarding(false)
      setAppMode({ isAppMode: false, hasAccess: false })
      setModuleProgress({})
      
      // Redirect to landing page
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      // Force redirect even if signOut fails
      window.location.href = '/'
    }
  }

  const value = {
    appMode,
    setAppMode,
    user,
    userProfile,
    loading,
    needsOnboarding,
    isOnboarding,
    setIsOnboarding,
    completeOnboarding,
    moduleProgress,
    updateModuleProgress,
    signIn,
    signUp,
    signOut
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}