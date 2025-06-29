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
      console.log('Loading profile for user:', user.id)
      
      // Just use the existing profiles table for now
      console.log('Loading from profiles table directly')
      await loadFromProfilesTable()
      
    } catch (err: any) {
      console.error('Error in loadProfile:', err)
      setError(err.message)
      // Always ensure we have a profile, even if it's just a fallback
      await createFallbackProfile()
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  // Fallback to load from the existing profiles table
  const loadFromProfilesTable = async () => {
    if (!user?.id) return

    try {
      console.log('Trying to load from profiles table for user:', user.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      console.log('Profiles table query result:', { data, error })

      if (error) {
        console.error('Profiles table query error:', error)
        console.log('Profiles table not available, using fallback profile')
        await createFallbackProfile()
        return
      }

      if (data) {
        console.log('Profile found in profiles table:', data)
        // Map the profiles table data to our ProfileSettings interface
        const mappedProfile: ProfileSettings = {
          id: data.id,
          name: data.name || '',
          username: '', // Not in profiles table
          bio: '', // Not in profiles table
          profile_picture_url: data.image || '',
          profile_visibility: 'public', // Default
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
          // Map existing fields
          language: data.language,
          region: data.region,
          stealth_mode: data.stealth_mode,
          sdg_goals: data.sdg_goals,
          low_tech_access: data.low_tech_access,
          business_type: data.business_type,
          time_commitment: data.time_commitment,
          capital_level: data.capital_level,
          completion_percentage: data.completion_percentage,
          created_at: data.created_at,
          updated_at: data.updated_at
        }
        setProfile(mappedProfile)
      } else {
        console.log('No profile found in profiles table, creating fallback')
        await createFallbackProfile()
      }
    } catch (err: any) {
      console.error('Error loading from profiles table:', err)
      await createFallbackProfile()
    }
  }

  // Create a fallback profile when all else fails
  const createFallbackProfile = async () => {
    console.log('Creating fallback profile for user:', user?.id)
    // Always create a fallback profile regardless of database state
    setProfile({
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
      email_verified: false
    })
    console.log('Fallback profile created successfully')
  }

  // Create initial profile if it doesn't exist
  const createInitialProfile = async () => {
    if (!user?.id) return

    try {
      console.log('Creating initial profile for user:', user.id)
      
      const initialProfile = {
        id: user.id,
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
        email_verified: false
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(initialProfile)
        .select()
        .single()

      console.log('Profile creation result:', { data, error })

      if (error) throw error

      setProfile(data)
      console.log('Created initial user profile')
    } catch (err: any) {
      console.error('Error creating initial profile:', err)
      // Fallback to creating a basic profile object
      await createFallbackProfile()
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<ProfileSettings>) => {
    if (!user?.id) return { data: null, error: 'User not authenticated' }

    setSaving(true)
    setError(null)

    try {
      let data, error

      // Try to update user_profiles first
      try {
        const result = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single()
        
        data = result.data
        error = result.error
        
        if (error) throw error
      } catch (userProfilesError) {
        console.log('user_profiles update failed, trying profiles table:', userProfilesError)
        
        // Fallback to updating the profiles table with compatible fields
        const profilesUpdates: any = {}
        if (updates.name !== undefined) profilesUpdates.name = updates.name
        if (updates.profile_picture_url !== undefined) profilesUpdates.image = updates.profile_picture_url
        
        if (Object.keys(profilesUpdates).length > 0) {
          const result = await supabase
            .from('profiles')
            .update(profilesUpdates)
            .eq('id', user.id)
            .select()
            .single()
          
          data = result.data
          error = result.error
          
          if (error) throw error
        }
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null)
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
      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('Profile loading timeout, setting fallback profile')
          setLoading(false)
          setError('Profile loading timed out')
          setProfile({
            id: user.id,
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
            email_verified: false
          })
        }
      }, 10000) // 10 second timeout

      loadProfile().finally(() => {
        clearTimeout(timeoutId)
      })

      return () => clearTimeout(timeoutId)
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