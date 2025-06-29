import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AppMode, ModuleProgress } from '../types/app'

interface AppContextType {
  // App mode state
  appMode: AppMode
  setAppMode: (mode: AppMode) => void
  
  // User state
  user: User | null
  userProfile: any | null
  loading: boolean
  
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
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({})

  // Initialize auth state
  useEffect(() => {
    let mounted = true
    
    // Add a timeout fallback in case auth hangs
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('Auth initialization timeout, proceeding without auth')
        setLoading(false)
      }
    }, 5000) // 5 second timeout
    
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return
        
        clearTimeout(timeoutId)
        
        if (error) {
          console.error('Auth session error:', error)
          setUser(null)
          setLoading(false)
          return
        }
        
        setUser(session?.user ?? null)
        if (session?.user) {
          loadUserProfile(session.user.id)
        }
        setLoading(false)
      })
      .catch((error) => {
        if (!mounted) return
        
        clearTimeout(timeoutId)
        console.error('Auth initialization error:', error)
        setUser(null)
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        try {
          setUser(session?.user ?? null)
          if (session?.user) {
            await loadUserProfile(session.user.id)
          } else {
            setUserProfile(null)
            setAppMode({ isAppMode: false, hasAccess: false })
          }
          setLoading(false)
        } catch (error) {
          console.error('Auth state change error:', error)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle to avoid errors when no rows found

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error loading user profile:', error)
        } else {
          console.log('User profile not found, will be created on first app access')
        }
        return
      }

      setUserProfile(data)
      setAppMode({ 
        isAppMode: false, // Start with waitlist view
        hasAccess: true // User has access if they're authenticated
      })
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  // Listen for profile updates in real-time
  useEffect(() => {
    if (!user?.id) return

    const subscription = supabase
      .channel('user_profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile updated:', payload)
          if (payload.eventType === 'UPDATE' && payload.new) {
            setUserProfile(payload.new)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id])

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

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setAppMode({ isAppMode: false, hasAccess: false })
  }

  const value = {
    appMode,
    setAppMode,
    user,
    userProfile,
    loading,
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