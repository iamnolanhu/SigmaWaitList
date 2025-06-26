// Google Analytics 4 setup
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

// Check if we're in production and GA is available
const isProduction = window.location.hostname !== 'localhost'

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Initialize Google Analytics
const initializeGA = () => {
  if (!isProduction || !GA_MEASUREMENT_ID) return false

  // Create dataLayer
  window.dataLayer = window.dataLayer || []
  
  // Define gtag function
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  window.gtag = gtag

  // Initialize gtag
  gtag('js', new Date())
  
  // Load GA script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)
  
  // Configure GA
  gtag('config', GA_MEASUREMENT_ID, {
    page_title: 'Sigma AI Business Partner',
    page_location: window.location.href,
    send_page_view: true
  })
  
  return true
}

// Initialize GA on first load
let isGAInitialized = false
const ensureGAInitialized = () => {
  if (!isGAInitialized) {
    isGAInitialized = initializeGA()
  }
  return isGAInitialized
}

// Initialize analytics on page load
export const initializeAnalytics = () => {
  if (ensureGAInitialized()) {
    trackPageView(window.location.pathname)
  }
}

// Track page views
export const trackPageView = (url: string) => {
  if (ensureGAInitialized() && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: 'Sigma AI Business Partner',
      page_location: window.location.href
    })
  }
}

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (ensureGAInitialized() && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: 'sigma_ai',
      ...parameters
    })
  } else if (!isProduction) {
    // Log events in development for debugging
    console.log('Analytics Event:', eventName, parameters)
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