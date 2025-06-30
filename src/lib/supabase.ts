import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Session configuration
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
const SESSION_WARNING_TIME = 5 * 60 * 1000 // 5 minutes before timeout

// Create Supabase client with custom configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key: string) => {
        // Check if "Remember Me" was selected
        const rememberMe = localStorage.getItem('rememberMe') === 'true'
        if (rememberMe) {
          return localStorage.getItem(key)
        }
        return sessionStorage.getItem(key)
      },
      setItem: (key: string, value: string) => {
        const rememberMe = localStorage.getItem('rememberMe') === 'true'
        if (rememberMe) {
          localStorage.setItem(key, value)
        } else {
          sessionStorage.setItem(key, value)
        }
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      }
    }
  }
})

// Activity tracking
let lastActivityTime = Date.now()
let activityTimer: NodeJS.Timeout | null = null
let warningTimer: NodeJS.Timeout | null = null

// Session management functions
export const sessionManager = {
  resetActivityTimer: () => {
    lastActivityTime = Date.now()
    
    // Clear existing timers
    if (activityTimer) clearTimeout(activityTimer)
    if (warningTimer) clearTimeout(warningTimer)
    
    // Set warning timer
    warningTimer = setTimeout(() => {
      // Dispatch custom event for session warning
      window.dispatchEvent(new CustomEvent('sessionWarning', {
        detail: { timeRemaining: SESSION_WARNING_TIME }
      }))
    }, SESSION_TIMEOUT - SESSION_WARNING_TIME)
    
    // Set timeout timer
    activityTimer = setTimeout(async () => {
      // Auto sign out on timeout
      await supabase.auth.signOut()
      window.dispatchEvent(new CustomEvent('sessionTimeout'))
    }, SESSION_TIMEOUT)
  },
  
  getTimeUntilTimeout: () => {
    const elapsed = Date.now() - lastActivityTime
    const remaining = SESSION_TIMEOUT - elapsed
    return Math.max(0, remaining)
  },
  
  startTracking: () => {
    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      window.addEventListener(event, sessionManager.resetActivityTimer)
    })
    
    // Start the timer
    sessionManager.resetActivityTimer()
  },
  
  stopTracking: () => {
    // Remove event listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      window.removeEventListener(event, sessionManager.resetActivityTimer)
    })
    
    // Clear timers
    if (activityTimer) clearTimeout(activityTimer)
    if (warningTimer) clearTimeout(warningTimer)
  }
}

// Auto-start session tracking when user is authenticated
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    sessionManager.startTracking()
  } else {
    sessionManager.stopTracking()
  }
})

// Database types
export interface Lead {
  id: string
  email: string | null
  created_at: string
}

export interface Profile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  customer_id: string | null
  price_id: string | null
  has_access: boolean | null
  created_at: string | null
  updated_at: string | null
}