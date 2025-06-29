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

  // Load user profile
  const loadProfile = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet - will be created by database trigger
          setProfile(null)
          console.log('User profile not found - will be created automatically')
        } else {
          throw error
        }
      } else {
        setProfile(data)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error loading user profile:', err)
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
      console.error('Error updating user profile:', err)
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

  // Upload profile picture
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

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl

      // Update profile with new picture URL
      await updateProfile({ profile_picture_url: publicUrl })

      return { url: publicUrl }
    } catch (err: any) {
      console.error('Error uploading profile picture:', err)
      return { error: err.message }
    }
  }

  // Delete profile picture
  const deleteProfilePicture = async (): Promise<{ error?: string }> => {
    if (!user?.id || !profile?.profile_picture_url) return { error: 'No profile picture to delete' }

    try {
      // Extract file path from URL
      const url = new URL(profile.profile_picture_url)
      const filePath = url.pathname.split('/').slice(-2).join('/')

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('profile-pictures')
        .remove([filePath])

      if (deleteError) throw deleteError

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
    if (user?.id) {
      loadProfile()
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