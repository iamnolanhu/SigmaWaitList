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
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id || !profile) return

    setLoading(true)
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
    
    const completed = fields.filter(field => 
      profileData[field as keyof UserProfile] && 
      profileData[field as keyof UserProfile] !== ''
    ).length

    return Math.round((completed / fields.length) * 100)
  }

  // Update completion percentage
  const updateCompletion = async () => {
    if (!profile) return

    const completion = calculateCompletion(profile)
    if (completion !== profile.completion_percentage) {
      await updateProfile({ completion_percentage: completion })
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  useEffect(() => {
    if (profile) {
      updateCompletion()
    }
  }, [profile?.name, profile?.region, profile?.business_type, profile?.time_commitment, profile?.capital_level])

  return {
    profile,
    loading,
    error,
    updateProfile,
    loadProfile,
    calculateCompletion
  }
}