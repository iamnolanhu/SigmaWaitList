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
  // Existing fields from user_profiles
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

  // Load user profile
  const loadProfile = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setError(null)

    try {
      // First check if user_profiles entry exists
      const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (userProfileError && userProfileError.code !== 'PGRST116') {
        throw userProfileError
      }

      // Also get basic profile info
      const { data: basicProfile, error: basicProfileError } = await supabase
        .from('profiles')
        .select('name, email, image, has_access, created_at, updated_at')
        .eq('id', user.id)
        .maybeSingle()

      if (basicProfileError && basicProfileError.code !== 'PGRST116') {
        throw basicProfileError
      }

      // Merge the data from both tables
      const mergedProfile: ProfileSettings = {
        id: user.id,
        name: basicProfile?.name || userProfile?.name || '',
        username: userProfile?.username || '',
        bio: userProfile?.bio || '',
        profile_picture_url: userProfile?.profile_picture_url || basicProfile?.image || '',
        profile_visibility: userProfile?.profile_visibility || 'public',
        contact_preferences: userProfile?.contact_preferences || {
          email: true,
          phone: false,
          marketing: false
        },
        notification_preferences: userProfile?.notification_preferences || {
          email: true,
          push: true,
          in_app: true,
          marketing: false
        },
        email_verified: userProfile?.email_verified || false,
        language: userProfile?.language || 'en',
        region: userProfile?.region || '',
        stealth_mode: userProfile?.stealth_mode || false,
        sdg_goals: userProfile?.sdg_goals || [],
        low_tech_access: userProfile?.low_tech_access || false,
        business_type: userProfile?.business_type || '',
        time_commitment: userProfile?.time_commitment || '',
        capital_level: userProfile?.capital_level || '',
        completion_percentage: userProfile?.completion_percentage || 0,
        created_at: userProfile?.created_at || basicProfile?.created_at,
        updated_at: userProfile?.updated_at || basicProfile?.updated_at
      }

      setProfile(mergedProfile)
    } catch (err: any) {
      console.error('Error loading profile:', err)
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<ProfileSettings>) => {
    if (!user?.id) return { data: null, error: 'User not authenticated' }

    setSaving(true)
    setError(null)

    try {
      // Separate updates for different tables
      const userProfileUpdates: any = {}
      const basicProfileUpdates: any = {}

      // Map fields to the correct table
      Object.entries(updates).forEach(([key, value]) => {
        switch (key) {
          case 'name':
            basicProfileUpdates.name = value
            userProfileUpdates.name = value
            break
          case 'username':
          case 'bio':
          case 'profile_picture_url':
          case 'profile_visibility':
          case 'contact_preferences':
          case 'notification_preferences':
          case 'email_verified':
          case 'language':
          case 'region':
          case 'stealth_mode':
          case 'sdg_goals':
          case 'low_tech_access':
          case 'business_type':
          case 'time_commitment':
          case 'capital_level':
          case 'completion_percentage':
            userProfileUpdates[key] = value
            break
          default:
            userProfileUpdates[key] = value
        }
      })

      // Update basic profile if needed
      if (Object.keys(basicProfileUpdates).length > 0) {
        const { error: basicError } = await supabase
          .from('profiles')
          .update(basicProfileUpdates)
          .eq('id', user.id)

        if (basicError) throw basicError
      }

      // Update user profile
      if (Object.keys(userProfileUpdates).length > 0) {
        // First try to update
        const { data: updateData, error: updateError } = await supabase
          .from('user_profiles')
          .update(userProfileUpdates)
          .eq('id', user.id)
          .select()
          .maybeSingle()

        if (updateError && updateError.code === 'PGRST116') {
          // No rows found, create the profile
          const { data: insertData, error: insertError } = await supabase
            .from('user_profiles')
            .insert([{ id: user.id, ...userProfileUpdates }])
            .select()
            .single()

          if (insertError) throw insertError
        } else if (updateError) {
          throw updateError
        }
      }

      // Reload profile to get updated data
      await loadProfile()
      
      return { data: profile, error: null }
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile')
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

  // Upload profile picture (simplified for now)
  const uploadProfilePicture = async (file: File): Promise<{ url?: string; error?: string }> => {
    if (!user?.id) return { error: 'User not authenticated' }

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { error: 'Please select an image file' }
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return { error: 'Image size must be less than 5MB' }
      }

      // For now, return a placeholder message
      // TODO: Implement actual file upload to Supabase Storage
      return { error: 'Profile picture upload coming soon!' }
    } catch (err: any) {
      console.error('Error uploading profile picture:', err)
      return { error: err.message }
    }
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
      // Only auto-save to user_profiles table
      const userProfileUpdates: any = {}
      
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id') {
          userProfileUpdates[key] = value
        }
      })

      if (Object.keys(userProfileUpdates).length > 0) {
        await supabase
          .from('user_profiles')
          .upsert({ id: user.id, ...userProfileUpdates })

        // Update local state
        setProfile(prev => prev ? { ...prev, ...updates } : null)
      }
    } catch (err) {
      console.error('Auto-save failed:', err)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    } else {
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