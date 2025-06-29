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
          // Profile doesn't exist yet - create it
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({ id: user.id })
            .select()
            .single()

          if (createError) {
            throw createError
          }
          
          setProfile(newProfile)
          console.log('Created new user profile')
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

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      return { data: null, error: 'User not authenticated' }
    }

    setLoading(true)
    setError(null)

    try {
      // Calculate completion percentage with the updates
      const updatedProfileData = { ...profile, ...updates }
      const completion = calculateCompletion(updatedProfileData as UserProfile)
      
      // Include completion percentage in the update
      const finalUpdates = {
        ...updates,
        completion_percentage: completion
      }

      // First, ensure the profile exists
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({ 
            id: user.id,
            ...finalUpdates
          })
          .select()
          .single()

        if (createError) throw createError

        setProfile(newProfile)
        return { data: newProfile, error: null }
      }

      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update(finalUpdates)
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
      setLoading(false)
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
    updateProfile,
    loadProfile,
    calculateCompletion
  }
}