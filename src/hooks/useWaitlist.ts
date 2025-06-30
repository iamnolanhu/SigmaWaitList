import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'

interface WaitlistState {
  loading: boolean
  success: boolean
  error: string | null
}

export const useWaitlist = () => {
  const [state, setState] = useState<WaitlistState>({
    loading: false,
    success: false,
    error: null
  })

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const submitEmail = async (email: string) => {
    setState({ loading: true, success: false, error: null })

    try {
      // Validate email format
      if (!email.trim()) {
        throw new Error('Email is required')
      }

      if (!validateEmail(email.trim())) {
        throw new Error('Please enter a valid email address')
      }

      // Check if email already exists
      const { data: existingLead, error: checkError } = await supabase
        .from('leads')
        .select('email')
        .eq('email', email.trim().toLowerCase())
        .limit(1)

      if (checkError) {
        throw new Error('Database error occurred')
      }

      if (existingLead && existingLead.length > 0) {
        throw new Error('This email is already on the waitlist')
      }

      // Insert new lead
      const { error: insertError } = await supabase
        .from('leads')
        .insert([{ email: email.trim().toLowerCase() }])

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        // Handle unique constraint violation
        if (insertError.code === '23505') {
          throw new Error('This email is already on the waitlist')
        }
        throw new Error('Failed to join waitlist. Please try again.')
      }

      setState({ loading: false, success: true, error: null })

      // Track conversion event
      trackEvent('sign_up', {
        method: 'email',
        event_label: 'waitlist_signup',
        value: 1
      })

    } catch (error) {
      setState({ 
        loading: false, 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      })
      
      // Track error event
      trackEvent('form_error', {
        error_message: error instanceof Error ? error.message : 'unknown_error',
        event_label: 'waitlist_signup_error'
      })
    }
  }

  const resetState = () => {
    setState({ loading: false, success: false, error: null })
  }

  return {
    ...state,
    submitEmail,
    resetState
  }
}