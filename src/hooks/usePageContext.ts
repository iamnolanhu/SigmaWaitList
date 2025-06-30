import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { generateSmartSuggestions, type SuggestionContext } from '../lib/openai'

interface PageContext {
  pageName: string
  pageType: 'profile' | 'automation' | 'dashboard' | 'onboarding' | 'other'
  currentStep?: string
  moduleType?: string
  suggestions: string[]
  formFields?: Record<string, any>
  isLoadingSuggestions?: boolean
}

export const usePageContext = (): PageContext => {
  const { appMode, userProfile, moduleProgress } = useApp()
  const [context, setContext] = useState<PageContext>({
    pageName: 'Dashboard',
    pageType: 'dashboard',
    suggestions: [],
    isLoadingSuggestions: false
  })

  useEffect(() => {
    // Analyze current page and user state to generate context
    const path = window.location.pathname
    const hash = window.location.hash
    
    let pageName = 'Dashboard'
    let pageType: PageContext['pageType'] = 'dashboard'
    let currentStep = ''
    let moduleType = ''
    let suggestions: string[] = []
    let formFields: Record<string, any> = {}

    // Check if we're in app mode
    if (appMode.isAppMode) {
      // Profile pages
      if (hash.includes('profile') || path.includes('profile')) {
        pageName = 'Profile Setup'
        pageType = 'profile'
        
        if (!userProfile?.name || !userProfile?.business_info?.business_name) {
          suggestions = [
            "Help me fill out my business profile",
            "What information do you need for my profile?",
            "Generate a professional business description for me",
            "Suggest a business name based on my industry"
          ]
        } else {
          suggestions = [
            "Review and optimize my business profile",
            "Suggest improvements for my business description",
            "Help me add more details to my profile",
            "Is my profile complete enough to start?"
          ]
        }
      }
      // Specific automation modules
      else if (hash.includes('business-setup') || hash.includes('legal')) {
        pageName = 'Legal & Business Setup'
        pageType = 'automation'
        moduleType = 'legal'
        
        // Smart suggestions based on what's missing
        const businessName = userProfile?.business_info?.business_name || ''
        const legalStructure = userProfile?.business_info?.legal_structure || ''
        
        if (!businessName) {
          suggestions = [
            "Generate 5 creative business names for my industry",
            "Check business name availability in all 50 states",
            "What makes a memorable and brandable business name?",
            "Suggest domain names that match my business idea"
          ]
        } else if (!legalStructure) {
          suggestions = [
            `Should ${businessName} be an LLC or Corporation?`,
            "Compare tax benefits: LLC vs S-Corp vs C-Corp",
            "What's the best state to incorporate my business?",
            "Calculate startup costs for each business structure"
          ]
        } else {
          suggestions = [
            `Draft operating agreement for my ${legalStructure}`,
            "What are the best states for LLC tax benefits?",
            `Register ${businessName} in Delaware vs my home state`,
            "Generate EIN application and state registration docs"
          ]
        }
        
        formFields = {
          businessName,
          legalStructure,
          state: userProfile?.business_info?.state || ''
        }
      }
      else if (hash.includes('brand-identity') || hash.includes('branding')) {
        pageName = 'Brand Identity'
        pageType = 'automation'
        moduleType = 'branding'
        
        suggestions = [
          "Create 3 logo concepts for my business",
          "What colors work best for my industry?",
          "Write a memorable tagline under 10 words",
          "Design professional business card layout"
        ]
      }
      else if (hash.includes('banking')) {
        pageName = 'Business Banking'
        pageType = 'automation'
        moduleType = 'banking'
        
        suggestions = [
          "Compare Chase vs Bank of America business accounts",
          "Which banks offer free business checking?",
          "What documents do I need to open an account?",
          "Best business credit cards with cash back"
        ]
      }
      else if (hash.includes('website')) {
        pageName = 'Website Builder'
        pageType = 'automation'
        moduleType = 'website'
        
        suggestions = [
          "Create 5-page website structure for my business",
          "Write compelling homepage headline and copy",
          "What are the top SEO keywords for my industry?",
          "Design mobile-friendly landing page"
        ]
      }
      else if (hash.includes('marketing')) {
        pageName = 'Marketing AI'
        pageType = 'automation'
        moduleType = 'marketing'
        
        suggestions = [
          "Create 30-day social media content calendar",
          "Write 5-email welcome sequence for new customers",
          "Generate 10 Instagram post ideas this week",
          "Best marketing channels for my budget"
        ]
      }
      else if (hash.includes('payment')) {
        pageName = 'Payment Setup'
        pageType = 'automation'
        moduleType = 'payment'
        
        suggestions = [
          "Compare Stripe vs Square vs PayPal fees",
          "How to accept payments on my website?",
          "Create professional invoice template",
          "Calculate fees for $10k monthly volume"
        ]
      }
      // General automation page
      else if (hash.includes('automation') || path.includes('automation')) {
        pageName = 'Automation Hub'
        pageType = 'automation'
        
        suggestions = [
          "What should I automate first?",
          "Show me all available automations",
          "Create a custom automation workflow",
          "Help me save time with AI"
        ]
      }
      // Onboarding
      else if (hash.includes('onboarding') || path.includes('onboarding')) {
        pageName = 'Onboarding'
        pageType = 'onboarding'
        
        const progress = Object.values(moduleProgress).filter(p => p.completed).length
        const total = Object.keys(moduleProgress).length || 5
        
        if (progress === 0) {
          suggestions = [
            "Guide me through the onboarding process",
            "What's the first step I should take?",
            "Show me an overview of all modules"
          ]
        } else if (progress < total) {
          suggestions = [
            "What's my next onboarding step?",
            "Help me complete the current module",
            "Show my onboarding progress"
          ]
        } else {
          suggestions = [
            "I've completed onboarding, what's next?",
            "Show me advanced features",
            "Help me optimize my setup"
          ]
        }
      }
      // Dashboard
      else {
        pageName = 'Dashboard'
        pageType = 'dashboard'
        
        suggestions = [
          "Show me my business overview",
          "What should I focus on today?",
          "Help me understand my metrics",
          "Create a task list for this week"
        ]
      }
    } else {
      // Landing page / waitlist
      pageName = 'Landing Page'
      pageType = 'other'
      
      suggestions = [
        "Tell me about BasedSigma",
        "How can AI help automate my business?",
        "What makes BasedSigma different?",
        "Show me pricing options"
      ]
    }

    // Add context-aware dynamic suggestions based on time of day
    const hour = new Date().getHours()
    if (hour < 12) {
      suggestions.push("What's my priority for this morning?")
    } else if (hour < 17) {
      suggestions.push("Help me plan the rest of my day")
    } else {
      suggestions.push("Show me today's summary")
    }

    // Set initial context with placeholder suggestions
    setContext(prev => ({
      pageName,
      pageType,
      currentStep,
      moduleType,
      suggestions: suggestions, // Use default suggestions initially
      formFields,
      isLoadingSuggestions: true
    }))

    // Fetch AI-powered suggestions if we have an API key
    if (import.meta.env.VITE_OPENAI_API_KEY && appMode.isAppMode) {
      const suggestionContext: SuggestionContext = {
        pageName,
        pageType,
        moduleType,
        userProfile: {
          name: userProfile?.name,
          email: userProfile?.email,
          businessInfo: {
            businessName: userProfile?.business_info?.business_name,
            industry: userProfile?.business_info?.industry,
            legalStructure: userProfile?.business_info?.legal_structure,
            state: userProfile?.business_info?.state,
            description: userProfile?.business_info?.description,
            targetAudience: userProfile?.business_info?.target_audience,
            businessStage: userProfile?.business_info?.stage
          },
          completion: userProfile?.completion_percentage
        },
        currentFormFields: formFields
      }

      // Fetch suggestions asynchronously
      generateSmartSuggestions(suggestionContext)
        .then(aiSuggestions => {
          setContext(prev => ({
            ...prev,
            suggestions: aiSuggestions,
            isLoadingSuggestions: false
          }))
        })
        .catch(error => {
          console.error('Failed to generate AI suggestions:', error)
          setContext(prev => ({
            ...prev,
            isLoadingSuggestions: false
          }))
        })
    } else {
      // No API key, use default suggestions
      setContext(prev => ({
        ...prev,
        isLoadingSuggestions: false
      }))
    }
  }, [appMode, userProfile, moduleProgress])

  return context
}