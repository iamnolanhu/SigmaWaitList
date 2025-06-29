import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../contexts/AppContext'

export interface UserProfile {
  id: string
  name?: string
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

export const useUserProfile = () => {
  const { user } = useApp()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate completion percentage
  const calculateCompletion = (profileData: UserProfile) => {
    const fields = [
      'name',
      'region', 
      'business_type',
      'time_commitment',
      'capital_level'
    ]
    
    const completed = fields.filter(field => {
      const value = profileData[field as keyof UserProfile]
      return value && value !== ''
    }).length

    return Math.round((completed / fields.length) * 100)
  }

  // Load user profile
  const loadProfile = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      console.log('Loading profile for user:', user.id)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error loading profile:', error)
        throw error
      }

      if (data) {
        console.log('Profile loaded:', data)
        setProfile(data)
      } else {
        console.log('No profile found, creating new one')
        // Create a new profile if none exists
        const newProfile = {
          id: user.id,
          completion_percentage: 0
        }
        
        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          throw createError
        }

        console.log('Profile created:', createdProfile)
        setProfile(createdProfile)
      }
    } catch (err: any) {
      console.error('Profile loading error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      console.error('No user ID available')
      return { data: null, error: 'User not authenticated' }
    }

    console.log('Updating profile with:', updates)
    setLoading(true)
    setError(null)

    try {
      // Calculate completion percentage with the updates
      const currentProfile = profile || { id: user.id }
      const updatedProfileData = { ...currentProfile, ...updates }
      const completion = calculateCompletion(updatedProfileData as UserProfile)
      
      // Include completion percentage in the update
      const finalUpdates = {
        ...updates,
        completion_percentage: completion,
        updated_at: new Date().toISOString()
      }

      console.log('Final updates to save:', finalUpdates)

      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      let result

      if (existingProfile) {
        // Update existing profile
        console.log('Updating existing profile')
        result = await supabase
          .from('user_profiles')
          .update(finalUpdates)
          .eq('id', user.id)
          .select()
          .single()
      } else {
        // Insert new profile
        console.log('Creating new profile')
        result = await supabase
          .from('user_profiles')
          .insert({ 
            id: user.id,
            ...finalUpdates
          })
          .select()
          .single()
      }

      const { data, error } = result

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Profile saved successfully:', data)
      setProfile(data)
      return { data, error: null }
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Load profile when user changes
  useEffect(() => {
    if (user?.id) {
      loadProfile()
    } else {
      setProfile(null)
    }
  }, [user?.id])

  return {
    profile,
    loading,
    error,
    updateProfile,
    loadProfile,
    calculateCompletion
  }
}