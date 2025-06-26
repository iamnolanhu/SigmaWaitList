// Google Analytics 4 setup
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

// Track page views
export const trackPageView = (url: string) => {
  if (typeof gtag !== 'undefined' && GA_MEASUREMENT_ID) {
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof gtag !== 'undefined' && GA_MEASUREMENT_ID) {
    gtag('event', eventName, {
      event_category: 'engagement',
      ...parameters
    })
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