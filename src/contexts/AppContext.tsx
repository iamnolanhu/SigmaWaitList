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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setUserProfile(null)
          setAppMode({ isAppMode: false, hasAccess: false })
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('Profile not found, will create on first app access')
        return
      }

      setUserProfile(data)
      setAppMode({ 
        isAppMode: false, // Start with waitlist view
        hasAccess: data?.has_access || false 
      })
    } catch (error) {
      console.error('Error loading user profile:', error)
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