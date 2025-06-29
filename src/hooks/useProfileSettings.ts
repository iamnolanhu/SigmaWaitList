import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../contexts/AppContext'

export interface ProfileSettings {
  id: string
  name?: string
  username?: string
  bio?: string
  profile_picture_url?: string
  profile_visibility?: 'public' | 'private' | 'friends'
  contact_preferences?: {
    email: boolean
    phone: boolean
    marketing: boolean
  }
  notification_preferences?: {
    email: boolean
    push: boolean
    in_app: boolean
    marketing: boolean
  }
  email_verified?: boolean
  // Existing fields
  language?: string
  region?: string
  stealth_mode?: boolean
  sdg_goals?: string[]
  low_tech_access?: boolean
  business_type?: string
  time_commitment?: string
  capital_level?: string
  completion_percentage?: number
  created_at?: string
  updated_at?: string
}

export const useProfileSettings = () => {
  const { user } = useApp()
  const [profile, setProfile] = useState<ProfileSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Create a simple fallback profile
  const createDefaultProfile = (): ProfileSettings => {
    return {
      id: user?.id || '',
      name: '',
      username: '',
      bio: '',
      profile_visibility: 'public',
      contact_preferences: {
        email: true,
        phone: false,
        marketing: false
      },
      notification_preferences: {
        email: true,
        push: true,
        in_app: true,
        marketing: false
      },
      email_verified: false,
      language: 'en',
      region: '',
      stealth_mode: false,
      sdg_goals: [],
      low_tech_access: false,
      business_type: '',
      time_commitment: '',
      capital_level: '',
      completion_percentage: 0
    }
  }

  // Super simple load function
  const loadProfile = async () => {
    console.log('=== LOADING PROFILE START ===')
    
    if (!user?.id) {
      console.log('No user ID, stopping loading')
      setLoading(false)
      return
    }

    try {
      console.log('Querying user_profiles for user:', user.id)
      
      // Try to get profile with a promise timeout
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 3000)
      )

      // Race the query against the timeout
      const result = await Promise.race([profilePromise, timeoutPromise]) as any

      console.log('Query result:', result)

      if (result.data) {
        console.log('Found profile, setting it')
        setProfile(result.data)
      } else {
        console.log('No profile found, creating default')
        const defaultProfile = createDefaultProfile()
        setProfile(defaultProfile)
      }

    } catch (err: any) {
      console.error('Error loading profile:', err)
      console.log('Creating fallback profile due to error')
      setError(err.message)
      const defaultProfile = createDefaultProfile()
      setProfile(defaultProfile)
    } finally {
      console.log('=== LOADING PROFILE END - Setting loading to false ===')
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<ProfileSettings>) => {
    if (!user?.id) return { data: null, error: 'User not authenticated' }

    setSaving(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setSaving(false)
    }
  }

  // Check username availability
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username || username.length < 3) return false

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .neq('id', user?.id || '')
        .limit(1)

      if (error) throw error
      return data.length === 0
    } catch (err) {
      console.error('Error checking username availability:', err)
      return false
    }
  }

  // Simplified upload function
  const uploadProfilePicture = async (file: File): Promise<{ url?: string; error?: string }> => {
    return { error: 'Profile picture upload coming soon!' }
  }

  // Delete profile picture
  const deleteProfilePicture = async (): Promise<{ error?: string }> => {
    try {
      await updateProfile({ profile_picture_url: null })
      return {}
    } catch (err: any) {
      return { error: err.message }
    }
  }

  // Change password
  const changePassword = async (newPassword: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
      return {}
    } catch (err: any) {
      return { error: err.message }
    }
  }

  // Auto-save functionality
  const autoSave = async (updates: Partial<ProfileSettings>) => {
    if (!user?.id) return

    try {
      await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)

      setProfile(prev => prev ? { ...prev, ...updates } : null)
    } catch (err) {
      console.error('Auto-save failed:', err)
    }
  }

  // Effect with absolute timeout guarantee
  useEffect(() => {
    console.log('useProfileSettings effect running, user:', user?.id)

    if (!user?.id) {
      setLoading(false)
      setProfile(null)
      return
    }

    // Absolute timeout - no matter what, stop loading after 2 seconds
    const absoluteTimeout = setTimeout(() => {
      console.log('ABSOLUTE TIMEOUT: Force stopping loading')
      setLoading(false)
      if (!profile) {
        console.log('No profile loaded, creating default')
        setProfile(createDefaultProfile())
      }
    }, 2000)

    // Load the profile
    loadProfile().finally(() => {
      clearTimeout(absoluteTimeout)
    })

    return () => {
      clearTimeout(absoluteTimeout)
    }
  }, [user?.id])

  console.log('useProfileSettings state:', { loading, profile: !!profile, error })

  return {
    profile,
    loading,
    error,
    saving,
    updateProfile,
    loadProfile,
    checkUsernameAvailability,
    uploadProfilePicture,
    deleteProfilePicture,
    changePassword,
    autoSave
  }
}