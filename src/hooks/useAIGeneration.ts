import { useState, useCallback } from 'react'
import { OpenRouterService } from '../lib/ai/openrouter'
import { AI_CONFIG, getOptimalModel } from '../lib/ai/config'
import { AIRequest, AIResponse } from '../types/app'
import { useUserProfile } from './useUserProfile'
import { cache } from '../lib/cache'

interface GenerationOptions {
  temperature?: number
  max_tokens?: number
  model?: string
  priority?: 'cost' | 'quality' | 'speed'
}

interface BusinessPlan {
  executive_summary: string
  market_analysis: {
    target_market: string
    market_size: string
    competitors: string[]
    unique_value_proposition: string
  }
  business_model: {
    revenue_streams: string[]
    pricing_strategy: string
    cost_structure: string[]
  }
  marketing_strategy: {
    channels: string[]
    customer_acquisition: string
    retention_strategy: string
  }
  financial_projections: {
    startup_costs: string
    monthly_burn_rate: string
    break_even_timeline: string
    revenue_projections: string
  }
  milestones: Array<{
    timeline: string
    goal: string
    metrics: string
  }>
}

interface MarketingStrategy {
  target_audience: {
    demographics: string
    psychographics: string
    pain_points: string[]
  }
  positioning: {
    brand_message: string
    unique_selling_points: string[]
    competitive_advantages: string[]
  }
  channels: Array<{
    name: string
    strategy: string
    budget_allocation: string
    expected_roi: string
  }>
  content_calendar: Array<{
    week: number
    theme: string
    content_types: string[]
    goals: string
  }>
  metrics: {
    kpis: string[]
    tracking_methods: string[]
    success_criteria: string
  }
}

export const useAIGeneration = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useUserProfile()

  const generateWithRetry = useCallback(async (
    request: AIRequest,
    maxRetries: number = 3
  ): Promise<AIResponse> => {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await OpenRouterService.completion(request)
        
        if (response.content && response.content.length > 0) {
          return response
        }
        
        throw new Error('Empty response from AI service')
      } catch (err) {
        lastError = err as Error
        console.error(`Attempt ${attempt + 1} failed:`, {
          error: err,
          error_message: (err as Error).message,
          error_name: (err as Error).name,
          is_network_error: (err as Error).message.includes('Failed to fetch'),
          is_api_key_error: (err as Error).message.includes('API key')
        })
        
        // For network errors, try fewer retries
        if ((err as Error).message.includes('Failed to fetch') && attempt >= 1) {
          console.log('Network error detected, stopping retries early')
          break
        }
        
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        }
      }
    }

    throw lastError || new Error('Failed to generate content after multiple attempts')
  }, [])

  const generateBusinessPlan = useCallback(async (
    businessIdea: string,
    options: GenerationOptions = {}
  ): Promise<BusinessPlan | null> => {
    setLoading(true)
    setError(null)

    try {
      const cacheKey = `business_plan_${businessIdea}_${profile?.id}`
      const cached = cache.get(cacheKey)
      if (cached) {
        setLoading(false)
        return cached as BusinessPlan
      }

      const profileContext = profile ? {
        business_type: profile.business_type,
        time_commitment: profile.time_commitment,
        capital_level: profile.capital_level,
        region: profile.region
      } : {}

      const prompt = `Generate a comprehensive business plan for the following idea: "${businessIdea}"

User Profile Context:
${JSON.stringify(profileContext, null, 2)}

Please provide a detailed business plan in the following JSON format:
{
  "executive_summary": "Brief overview of the business",
  "market_analysis": {
    "target_market": "Description of target customers",
    "market_size": "Estimated market size and growth potential",
    "competitors": ["List of main competitors"],
    "unique_value_proposition": "What makes this business unique"
  },
  "business_model": {
    "revenue_streams": ["Primary ways to generate revenue"],
    "pricing_strategy": "How to price products/services",
    "cost_structure": ["Major cost categories"]
  },
  "marketing_strategy": {
    "channels": ["Marketing channels to use"],
    "customer_acquisition": "How to attract customers",
    "retention_strategy": "How to keep customers"
  },
  "financial_projections": {
    "startup_costs": "Estimated initial investment needed",
    "monthly_burn_rate": "Expected monthly expenses",
    "break_even_timeline": "When the business will be profitable",
    "revenue_projections": "Expected revenue in first year"
  },
  "milestones": [
    {
      "timeline": "Month 1-3",
      "goal": "Specific goal",
      "metrics": "How to measure success"
    }
  ]
}

Make the plan realistic based on the user's capital level and time commitment. Focus on actionable steps and practical implementation.`

      const request: AIRequest = {
        model: options.model || getOptimalModel('business-planning', options.priority),
        prompt,
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.7,
        context: {
          task_type: 'business-planning',
          user_profile: profileContext
        },
        user_id: profile?.id || 'anonymous',
        session_id: `business_plan_${Date.now()}`
      }

      const response = await generateWithRetry(request)
      
      try {
        const plan = JSON.parse(response.content) as BusinessPlan
        cache.set(cacheKey, plan, 15 * 60 * 1000) // Cache for 15 minutes
        setLoading(false)
        return plan
      } catch (parseError) {
        console.error('Failed to parse business plan JSON:', parseError)
        setError('Failed to parse AI response. Please try again.')
        setLoading(false)
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setLoading(false)
      return null
    }
  }, [profile, generateWithRetry])

  const generateBusinessName = useCallback(async (
    industry: string,
    keywords: string[],
    options: GenerationOptions = {}
  ): Promise<string[]> => {
    setLoading(true)
    setError(null)

    try {
      const prompt = `Generate 10 creative, memorable business names for a ${industry} company.

Keywords to incorporate (use some but not necessarily all): ${keywords.join(', ')}

Requirements:
- Names should be easy to pronounce and spell
- Check for domain availability potential (prefer .com friendly names)
- Avoid generic or overused terms
- Consider international appeal
- Mix of different naming styles (descriptive, invented, metaphorical, acronym)

Return ONLY a JSON array of strings, no explanation needed:
["Name1", "Name2", "Name3", ...]`

      const request: AIRequest = {
        model: options.model || getOptimalModel('text-generation', options.priority || 'quality'),
        prompt,
        max_tokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.9,
        context: {
          task_type: 'branding'
        },
        user_id: profile?.id || 'anonymous',
        session_id: `business_name_${Date.now()}`
      }

      const response = await generateWithRetry(request)
      
      try {
        const names = JSON.parse(response.content) as string[]
        setLoading(false)
        return names
      } catch (parseError) {
        console.error('Failed to parse business names JSON:', parseError)
        setError('Failed to parse AI response. Please try again.')
        setLoading(false)
        return []
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setLoading(false)
      return []
    }
  }, [profile, generateWithRetry])

  const generateMarketingStrategy = useCallback(async (
    businessIdea: string,
    businessPlan?: BusinessPlan,
    options: GenerationOptions = {}
  ): Promise<MarketingStrategy | null> => {
    setLoading(true)
    setError(null)

    try {
      const cacheKey = `marketing_strategy_${businessIdea}_${profile?.id}`
      const cached = cache.get(cacheKey)
      if (cached) {
        setLoading(false)
        return cached as MarketingStrategy
      }

      const prompt = `Create a comprehensive marketing strategy for a ${businessIdea} business.

Please provide a detailed marketing strategy in the following JSON format:
{
  "target_audience": {
    "demographics": "Age, gender, income, location details",
    "psychographics": "Interests, values, lifestyle",
    "pain_points": ["Main problems they face"]
  },
  "positioning": {
    "brand_message": "Core message to communicate",
    "unique_selling_points": ["What makes us different"],
    "competitive_advantages": ["Why choose us over competitors"]
  },
  "channels": [
    {
      "name": "Channel name (e.g., Social Media, Email)",
      "strategy": "How to use this channel",
      "budget_allocation": "Percentage of budget",
      "expected_roi": "Expected return on investment"
    }
  ],
  "content_calendar": [
    {
      "week": 1,
      "theme": "Weekly content theme",
      "content_types": ["Blog post", "Social media", "Email"],
      "goals": "What to achieve this week"
    }
  ],
  "metrics": {
    "kpis": ["Key performance indicators to track"],
    "tracking_methods": ["How to measure success"],
    "success_criteria": "Definition of success"
  }
}

Focus on practical, actionable strategies that can be implemented immediately with limited resources.`

      const request: AIRequest = {
        model: options.model || getOptimalModel('business-planning', options.priority),
        prompt,
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.7,
        context: {
          task_type: 'marketing',
          business_type: businessIdea,
          business_plan: businessPlan
        },
        user_id: profile?.id || 'anonymous',
        session_id: `marketing_${Date.now()}`
      }

      const response = await generateWithRetry(request)
      
      try {
        const strategy = JSON.parse(response.content) as MarketingStrategy
        cache.set(cacheKey, strategy, 15 * 60 * 1000) // Cache for 15 minutes
        setLoading(false)
        return strategy
      } catch (parseError) {
        console.error('Failed to parse marketing strategy JSON:', parseError)
        setError('Failed to parse AI response. Please try again.')
        setLoading(false)
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setLoading(false)
      return null
    }
  }, [profile, generateWithRetry])

  const generateCustom = useCallback(async (
    prompt: string,
    taskType: string = 'general',
    options: GenerationOptions = {}
  ): Promise<string | null> => {
    setLoading(true)
    setError(null)

    try {
      const request: AIRequest = {
        model: options.model || AI_CONFIG.DEFAULT_MODELS.GENERAL,
        prompt,
        max_tokens: options.max_tokens || 2000,
        temperature: options.temperature || 0.7,
        context: {
          task_type: taskType,
          user_profile: profile
        },
        user_id: profile?.id || 'anonymous',
        session_id: `custom_${Date.now()}`
      }

      const response = await generateWithRetry(request)
      setLoading(false)
      return response.content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setLoading(false)
      return null
    }
  }, [profile, generateWithRetry])

  return {
    generateBusinessPlan,
    generateBusinessName,
    generateMarketingStrategy,
    generateCustom,
    loading,
    error
  }
}