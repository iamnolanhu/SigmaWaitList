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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Create a guaranteed fallback profile
  const createFallbackProfile = () => {
    console.log('Creating fallback profile for user:', user?.id)
    const fallbackProfile: ProfileSettings = {
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
    setProfile(fallbackProfile)
    console.log('Fallback profile created successfully')
    return fallbackProfile
  }

  // Load user profile
  const loadProfile = async () => {
    if (!user?.id) {
      console.log('No user ID available')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    console.log('Starting profile load for user:', user.id)

    try {
      // First try to load from user_profiles table (new table with all columns)
      console.log('Attempting to load from user_profiles table')
      const { data: userProfileData, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      console.log('user_profiles query result:', { data: userProfileData, error: userProfileError })

      if (userProfileData) {
        console.log('Found profile in user_profiles table')
        setProfile(userProfileData)
        return
      }

      if (userProfileError && userProfileError.code !== 'PGRST116') {
        console.error('user_profiles query error:', userProfileError)
      }

      // If no profile in user_profiles, try to create one from the profiles table data
      console.log('No profile in user_profiles, checking profiles table')
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      console.log('profiles query result:', { data: profileData, error: profileError })

      if (profileData) {
        console.log('Found data in profiles table, creating user_profiles record')
        // Create a user_profiles record from the profiles data
        const newUserProfile = {
          id: profileData.id,
          name: profileData.name || '',
          language: 'en',
          region: '',
          stealth_mode: false,
          sdg_goals: [],
          low_tech_access: false,
          business_type: '',
          time_commitment: '',
          capital_level: '',
          completion_percentage: 0,
          username: '',
          bio: '',
          profile_picture_url: profileData.image || '',
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
          email_verified: false
        }

        // Try to insert into user_profiles
        const { data: insertedData, error: insertError } = await supabase
          .from('user_profiles')
          .insert(newUserProfile)
          .select()
          .single()

        if (insertError) {
          console.error('Failed to create user_profiles record:', insertError)
          // Use the data we have as fallback
          setProfile(newUserProfile)
        } else {
          console.log('Successfully created user_profiles record')
          setProfile(insertedData)
        }
        return
      }

      // If we get here, no profile exists anywhere - create fallback
      console.log('No profile found in any table, creating fallback')
      createFallbackProfile()

    } catch (err: any) {
      console.error('Error in loadProfile:', err)
      setError(err.message)
      // Always provide a fallback profile
      createFallbackProfile()
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<ProfileSettings>) => {
    if (!user?.id) return { data: null, error: 'User not authenticated' }

    setSaving(true)
    setError(null)

    try {
      console.log('Updating profile with:', updates)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Update error:', error)
        throw error
      }

      console.log('Update successful:', data)
      setProfile(data)
      return { data, error: null }
    } catch (err: any) {
      console.error('Error updating user profile:', err)
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

  // Upload profile picture - simplified to avoid storage issues for now
  const uploadProfilePicture = async (file: File): Promise<{ url?: string; error?: string }> => {
    if (!user?.id) return { error: 'User not authenticated' }

    try {
      // For now, just return an error since storage might not be set up
      return { error: 'Profile picture upload is not yet available. Coming soon!' }
    } catch (err: any) {
      console.error('Error uploading profile picture:', err)
      return { error: err.message }
    }
  }

  // Delete profile picture
  const deleteProfilePicture = async (): Promise<{ error?: string }> => {
    if (!user?.id || !profile?.profile_picture_url) return { error: 'No profile picture to delete' }

    try {
      // Update profile to remove picture URL
      await updateProfile({ profile_picture_url: null })
      return {}
    } catch (err: any) {
      console.error('Error deleting profile picture:', err)
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
      console.error('Error changing password:', err)
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

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    } catch (err) {
      console.error('Auto-save failed:', err)
    }
  }

  useEffect(() => {
    console.log('useProfileSettings effect triggered, user:', user?.id)
    
    if (user?.id) {
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('Profile loading timeout - force creating fallback')
          setLoading(false)
          setError('Profile loading timed out')
          createFallbackProfile()
        }
      }, 5000) // 5 second timeout

      loadProfile().finally(() => {
        clearTimeout(timeoutId)
      })

      return () => clearTimeout(timeoutId)
    } else {
      // No user, immediately stop loading
      setLoading(false)
      setProfile(null)
    }
  }, [user?.id])

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