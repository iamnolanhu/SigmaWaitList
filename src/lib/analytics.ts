// Google Analytics 4 setup
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

// Check if we're in production and GA is available
const isProduction = window.location.hostname !== 'localhost'
const isGAAvailable = typeof gtag !== 'undefined' && GA_MEASUREMENT_ID

// Initialize analytics on page load
export const initializeAnalytics = () => {
  if (isGAAvailable && isProduction) {
    trackPageView(window.location.pathname)
  }
}

// Track page views
export const trackPageView = (url: string) => {
  if (isGAAvailable && isProduction) {
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: 'Sigma AI Business Partner',
      page_location: window.location.href
    })
  }
}

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (isGAAvailable && isProduction) {
    gtag('event', eventName, {
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