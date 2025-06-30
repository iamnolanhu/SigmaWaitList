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
    if (!user?.id) {
      console.log('No user ID available for profile loading')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Loading profile for user:', user.id)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (!data) {
        // Profile doesn't exist yet - create it
        console.log('Profile not found, creating new profile')
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({ 
            id: user.id,
            completion_percentage: 0
          })
          .select()
          .single()

        if (createError) {
          throw createError
        }
        
        setProfile(newProfile)
        console.log('Created new user profile:', newProfile)
      } else {
        setProfile(data)
        console.log('Loaded existing profile:', data)
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

  // Update user profile with proper error handling and real-time sync
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      return { data: null, error: 'User not authenticated' }
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Updating profile with data:', updates)
      
      // Calculate completion percentage with the updates
      const updatedProfileData = { ...profile, ...updates }
      const completion = calculateCompletion(updatedProfileData as UserProfile)
      
      // Include completion percentage in the update
      const finalUpdates = {
        ...updates,
        completion_percentage: completion,
        updated_at: new Date().toISOString()
      }

      console.log('Final updates to save:', finalUpdates)

      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ 
          id: user.id,
          ...finalUpdates
        }, {
          onConflict: 'id'
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      setProfile(data)
      console.log('Profile updated successfully:', data)
      
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating user profile:', err)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Create business profile from user profile
  const createBusinessProfile = () => {
    if (!profile || !user?.id) return null

    return {
      id: profile.id,
      user_id: user.id,
      business_name: profile.name || '',
      business_type: profile.business_type || '',
      industry: profile.business_type || '',
      description: `${profile.business_type} business` || '',
      target_market: '',
      budget_range: profile.capital_level || '',
      timeline: profile.time_commitment || '',
      legal_structure: 'LLC' as const,
      state_of_incorporation: profile.region || ''
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user?.id])

  // Listen for real-time updates
  useEffect(() => {
    if (!user?.id) return

    console.log('Setting up real-time subscription for user:', user.id)
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
          console.log('Profile updated via real-time:', payload)
          if (payload.eventType === 'UPDATE' && payload.new) {
            setProfile(payload.new as UserProfile)
          } else if (payload.eventType === 'INSERT' && payload.new) {
            setProfile(payload.new as UserProfile)
          }
        }
      )
      .subscribe()

    return () => {
      console.log('Unsubscribing from real-time updates')
      subscription.unsubscribe()
    }
  }, [user?.id])

  return {
    profile,
    loading,
    error,
    updateProfile,
    loadProfile,
    calculateCompletion,
    createBusinessProfile
  }
}