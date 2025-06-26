// Google Analytics 4 setup with improved debugging and error handling
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

// More robust production check
const isProduction = import.meta.env.PROD || 
  (typeof window !== 'undefined' && 
   !window.location.hostname.includes('localhost') && 
   !window.location.hostname.includes('127.0.0.1') &&
   !window.location.hostname.includes('.local'))

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Debug logging function
const debugLog = (message: string, data?: any) => {
  if (!isProduction) {
    console.log(`[Analytics Debug] ${message}`, data || '')
  }
}

// Initialize Google Analytics
const initializeGA = (): boolean => {
  debugLog('Attempting to initialize GA', { 
    isProduction, 
    GA_MEASUREMENT_ID: GA_MEASUREMENT_ID ? 'Set' : 'Not set',
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'Unknown'
  })

  if (!GA_MEASUREMENT_ID) {
    debugLog('GA_MEASUREMENT_ID not found in environment variables')
    return false
  }

  if (!isProduction) {
    debugLog('Not in production mode, skipping GA initialization')
    return false
  }

  try {
    // Create dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || []
    
    // Define gtag function
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag

    // Initialize gtag with current timestamp
    gtag('js', new Date())
    
    // Load GA script dynamically
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    
    script.onload = () => {
      debugLog('GA script loaded successfully')
      // Configure GA after script loads
      gtag('config', GA_MEASUREMENT_ID, {
        page_title: 'Sigma AI Business Partner',
        page_location: window.location.href,
        send_page_view: true,
        // Enhanced configuration
        allow_google_signals: true,
        allow_ad_personalization_signals: false
      })
      debugLog('GA configured successfully')
    }
    
    script.onerror = () => {
      debugLog('Failed to load GA script')
    }
    
    document.head.appendChild(script)
    debugLog('GA script added to document head')
    
    return true
  } catch (error) {
    debugLog('Error initializing GA', error)
    return false
  }
}

// Initialize GA on first load
let isGAInitialized = false
const ensureGAInitialized = (): boolean => {
  if (!isGAInitialized) {
    isGAInitialized = initializeGA()
  }
  return isGAInitialized
}

// Initialize analytics on page load
export const initializeAnalytics = () => {
  debugLog('initializeAnalytics called')
  const initialized = ensureGAInitialized()
  
  if (initialized) {
    // Small delay to ensure GA is fully loaded
    setTimeout(() => {
      trackPageView(window.location.pathname)
    }, 100)
  }
}

// Track page views
export const trackPageView = (url: string) => {
  debugLog('trackPageView called', { url })
  
  if (ensureGAInitialized() && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: 'Sigma AI Business Partner',
      page_location: window.location.href
    })
    debugLog('Page view tracked', { url })
  }
}

// Track custom events with better error handling
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  debugLog('trackEvent called', { eventName, parameters })
  
  if (ensureGAInitialized() && window.gtag) {
    try {
      window.gtag('event', eventName, {
        event_category: 'engagement',
        event_label: 'sigma_ai',
        ...parameters
      })
      debugLog('Event tracked successfully', { eventName, parameters })
    } catch (error) {
      debugLog('Error tracking event', { eventName, error })
    }
  } else {
    debugLog('GA not available, event not tracked', { eventName, parameters })
  }
}

// Track waitlist signup
export const trackWaitlistSignup = (email: string) => {
  trackEvent('sign_up', {
    method: 'email',
    event_label: 'waitlist_signup',
    custom_parameter_1: 'sigma_waitlist'
  })
}

// Track video interactions
export const trackVideoInteraction = (action: 'play' | 'pause' | 'mute' | 'unmute') => {
  trackEvent('video_interaction', {
    event_label: 'demo_video',
    action: action
  })
}

// Track section views
export const trackSectionView = (sectionName: string) => {
  trackEvent('section_view', {
    event_label: sectionName
  })
}

// Add a function to check GA status (for debugging)
export const getAnalyticsStatus = () => {
  return {
    isProduction,
    hasGAId: !!GA_MEASUREMENT_ID,
    gaIdValue: GA_MEASUREMENT_ID || 'Not set',
    isInitialized: isGAInitialized,
    hasGtagFunction: typeof window !== 'undefined' && typeof window.gtag === 'function',
    hasDataLayer: typeof window !== 'undefined' && Array.isArray(window.dataLayer),
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'Unknown'
  }
}

// Expose debug function globally in development
if (!isProduction && typeof window !== 'undefined') {
  (window as any).sigmaAnalytics = {
    getStatus: getAnalyticsStatus,
    trackTest: () => trackEvent('test_event', { test: true }),
    forceInit: () => {
      isGAInitialized = false
      return initializeGA()
    }
  }
  debugLog('Analytics debug tools available at window.sigmaAnalytics')
}