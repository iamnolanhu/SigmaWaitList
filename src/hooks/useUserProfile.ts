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

  // Test database connection - simplified and more reliable
  const testConnection = async () => {
    try {
      console.log('Testing database connection...')
      
      // Simple connection test - just try to access the table
      const { error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)

      if (error) {
        console.error('Connection test failed:', error)
        return { connected: false, error: error.message }
      }

      console.log('Database connection test passed')
      return { connected: true, error: null }
    } catch (err: any) {
      console.error('Connection test exception:', err)
      return { connected: false, error: err.message || 'Connection failed' }
    }
  }

  // Load user profile with better error handling
  const loadProfile = async () => {
    if (!user?.id) {
      console.log('No user ID available for profile loading')
      setProfile(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Loading profile for user:', user.id)

      // Try to get the actual profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Profile query error:', error)
        throw new Error(`Profile query failed: ${error.message}`)
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
          console.error('Error creating profile:', createError)
          throw new Error(`Failed to create profile: ${createError.message}`)
        }
        
        setProfile(newProfile)
        console.log('Created new user profile:', newProfile)
      } else {
        setProfile(data)
        console.log('Loaded existing profile:', data)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load profile'
      setError(errorMessage)
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

  // Update user profile with robust error handling and proper upsert
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      return { data: null, error: 'User not authenticated' }
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Attempting to save profile:', updates)
      
      // Calculate completion percentage with the updates
      const updatedProfileData = { ...profile, ...updates }
      const completion = calculateCompletion(updatedProfileData as UserProfile)
      
      // Include completion percentage in the update
      const finalUpdates = {
        id: user.id, // Always include the ID for upsert
        ...updates,
        completion_percentage: completion
      }

      console.log('Final updates to save:', finalUpdates)

      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(finalUpdates, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) {
        console.error('Database error during update:', error)
        throw new Error(`Save failed: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned from save operation')
      }

      setProfile(data)
      console.log('Profile updated successfully:', data)
      
      return { data, error: null }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile'
      setError(errorMessage)
      console.error('Error updating user profile:', err)
      return { data: null, error: errorMessage }
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

  // Load profile when user changes
  useEffect(() => {
    if (user?.id) {
      loadProfile().catch(err => {
        console.error('Failed to load profile on user change:', err)
      })
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
    createBusinessProfile,
    testConnection
  }
}