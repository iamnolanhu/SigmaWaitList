// App-wide type definitions for BasedSigma
export interface User {
  id: string
  email: string
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

export interface AppMode {
  isAppMode: boolean
  hasAccess: boolean
}

export interface BusinessData {
  id?: string
  user_id: string
  business_name?: string
  tagline?: string
  domain_ideas?: string[]
  logo_url?: string
  color_palette?: Record<string, any>
  font_selections?: Record<string, any>
  brand_kit_url?: string
  created_at?: string
}

export interface AIResponse {
  content: string
  confidence?: number
  model_used?: string
  prompt_used?: string
  reasoning?: string
}

export type ModuleType = 
  | 'dashboard' 
  | 'onboarding' 
  | 'branding' 
  | 'legal' 
  | 'marketing' 
  | 'revenue' 
  | 'impact' 
  | 'grants' 
  | 'strategy' 
  | 'community'

export interface ModuleProgress {
  [key: string]: {
    completed: boolean
    progress: number
    last_updated?: string
  }
}