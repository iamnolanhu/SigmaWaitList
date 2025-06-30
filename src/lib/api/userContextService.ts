import { supabase } from '../supabase'
import { CompleteProfile } from './optimizedProfileService'
import { ModuleActivation } from '../../hooks/useModuleActivation'
import { getModuleById } from '../modules/moduleDefinitions'

interface UserContext {
  user_id: string
  name: string
  email: string
  joined_date: string
  
  business: {
    name?: string
    industry?: string
    legal_structure?: string
    state?: string
    stage?: string
    description?: string
    target_audience?: string
    business_model?: string
    business_type?: string
    time_commitment?: string
    capital_level?: string
  }
  
  progress: {
    profile_completion: number
    modules_completed: string[]
    modules_active: string[]
    total_tasks_completed: number
    last_activity: string
  }
  
  decisions: Array<{
    type: string
    choice: string
    reason?: string
    date: string
  }>
  
  outputs: {
    documents: string[]
    branding?: {
      logo_generated: boolean
      colors?: string[]
      brand_name?: string
    }
    website?: {
      domain?: string
      status: string
    }
  }
  
  preferences: {
    communication_style: string
    time_commitment?: string
    capital_available?: string
    stealth_mode: boolean
    language: string
    region?: string
  }
  
  conversation_history: {
    total_messages: number
    common_topics: string[]
    last_conversation?: string
    key_questions_asked: string[]
  }
}

export class UserContextService {
  /**
   * Generate a comprehensive user context for AI consumption
   */
  static async generateUserContext(
    userId: string,
    profile: CompleteProfile,
    modules?: ModuleActivation[]
  ): Promise<{ yaml: string; json: any; hash: string }> {
    
    // Fetch additional data if not provided
    const moduleActivations = modules || await this.fetchModuleActivations(userId)
    const conversationStats = await this.fetchConversationStats(userId)
    const userDecisions = await this.fetchUserDecisions(userId)
    
    // Build context object
    const context: UserContext = {
      user_id: userId,
      name: profile.name || 'User',
      email: profile.email || '',
      joined_date: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      
      business: {
        name: profile.business_info?.business_name,
        industry: profile.business_info?.industry || profile.industry,
        legal_structure: profile.business_info?.legal_structure,
        state: profile.business_info?.state,
        stage: profile.business_info?.stage || profile.skill_level,
        description: profile.business_info?.description,
        target_audience: profile.business_info?.target_audience,
        business_model: profile.business_info?.business_model,
        business_type: profile.business_type,
        time_commitment: profile.time_commitment,
        capital_level: profile.capital_level
      },
      
      progress: {
        profile_completion: profile.completion_percentage || 0,
        modules_completed: moduleActivations
          .filter(m => m.status === 'completed')
          .map(m => m.module_id),
        modules_active: moduleActivations
          .filter(m => m.status === 'active')
          .map(m => m.module_id),
        total_tasks_completed: moduleActivations
          .filter(m => m.status === 'completed').length,
        last_activity: moduleActivations.length > 0 
          ? new Date(Math.max(...moduleActivations.map(m => new Date(m.last_activity).getTime()))).toISOString()
          : new Date().toISOString()
      },
      
      decisions: userDecisions,
      
      outputs: {
        documents: this.extractDocuments(moduleActivations),
        branding: this.extractBrandingOutputs(moduleActivations),
        website: this.extractWebsiteOutputs(moduleActivations)
      },
      
      preferences: {
        communication_style: profile.preferences?.communication_style || 'concise',
        time_commitment: profile.time_commitment,
        capital_available: profile.capital_level,
        stealth_mode: profile.stealth_mode || false,
        language: profile.language || 'en',
        region: profile.region
      },
      
      conversation_history: conversationStats
    }
    
    // Generate YAML
    const yaml = this.generateYAML(context)
    
    // Calculate hash using browser-compatible method
    const hash = this.simpleHash(yaml)
    
    return { yaml, json: context, hash }
  }
  
  /**
   * Update user context in the database
   */
  static async updateUserContext(userId: string, profile: CompleteProfile, modules?: ModuleActivation[]): Promise<boolean> {
    try {
      const { yaml, json, hash } = await this.generateUserContext(userId, profile, modules)
      
      // Check if table exists first
      const { error: tableCheckError } = await supabase
        .from('user_context_master')
        .select('id')
        .limit(1)
      
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.log('user_context_master table does not exist yet, skipping update')
        return false
      }
      
      // Check if context has changed
      const { data: existing, error: selectError } = await supabase
        .from('user_context_master')
        .select('context_hash')
        .eq('user_id', userId)
        .single()
      
      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing context:', selectError)
        return false
      }
      
      if (existing?.context_hash === hash) {
        console.log('Context unchanged, skipping update')
        return true
      }
      
      // Update context using the stored function
      const { data, error } = await supabase.rpc('update_user_context', {
        p_user_id: userId,
        p_context_yaml: yaml,
        p_context_json: json,
        p_context_hash: hash
      })
      
      if (error) {
        if (error.code === 'PGRST202') {
          console.log('update_user_context function does not exist yet, skipping update')
          return false
        }
        console.error('Error updating user context:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in updateUserContext:', error)
      return false
    }
  }
  
  /**
   * Get user context from database
   */
  static async getUserContext(userId: string): Promise<string | null> {
    try {
      // Check if table exists first
      const { error: tableCheckError } = await supabase
        .from('user_context_master')
        .select('id')
        .limit(1)
      
      if (tableCheckError && tableCheckError.code === '42P01') {
        console.log('user_context_master table does not exist yet')
        return null
      }
      
      const { data, error } = await supabase
        .from('user_context_master')
        .select('context_yaml')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        // Context doesn't exist yet, generate it
        if (error.code === 'PGRST116') {
          return null
        }
        if (error.code === '42P01') {
          console.log('user_context_master table does not exist')
          return null
        }
        throw error
      }
      
      return data.context_yaml
    } catch (error) {
      console.error('Error getting user context:', error)
      return null
    }
  }
  
  /**
   * Fetch module activations
   */
  private static async fetchModuleActivations(userId: string): Promise<ModuleActivation[]> {
    const { data, error } = await supabase
      .from('module_activations')
      .select('*')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching module activations:', error)
      return []
    }
    
    return data || []
  }
  
  /**
   * Fetch conversation statistics
   */
  private static async fetchConversationStats(userId: string): Promise<UserContext['conversation_history']> {
    try {
      // First get user's conversation IDs
      const { data: conversations } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', userId)
      
      const conversationIds = conversations?.map(c => c.id) || []
      
      // Get message count for user's conversations
      const { count } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
      
      // Get recent topics from memory
      const { data: memories } = await supabase
        .from('chat_memory')
        .select('key, value')
        .eq('user_id', userId)
        .eq('category', 'topic')
        .limit(5)
      
      // Get last conversation date
      const { data: lastConvo } = await supabase
        .from('chat_conversations')
        .select('updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
      
      return {
        total_messages: count || 0,
        common_topics: memories?.map(m => m.value) || [],
        last_conversation: lastConvo?.updated_at,
        key_questions_asked: [] // Could analyze messages for questions
      }
    } catch (error) {
      console.error('Error fetching conversation stats:', error)
      return {
        total_messages: 0,
        common_topics: [],
        key_questions_asked: []
      }
    }
  }
  
  /**
   * Fetch user decisions from module metadata
   */
  private static async fetchUserDecisions(userId: string): Promise<UserContext['decisions']> {
    const { data } = await supabase
      .from('module_activations')
      .select('module_id, metadata, last_activity')
      .eq('user_id', userId)
      .filter('status', 'eq', 'completed')
    
    const decisions: UserContext['decisions'] = []
    
    data?.forEach(module => {
      if (module.module_id === 'MOD_201' && module.metadata?.legal_structure) {
        decisions.push({
          type: 'legal_structure',
          choice: module.metadata.legal_structure,
          reason: module.metadata.legal_reason,
          date: module.last_activity || new Date().toISOString()
        })
      }
      if (module.module_id === 'MOD_201' && module.metadata?.state) {
        decisions.push({
          type: 'incorporation_state',
          choice: module.metadata.state,
          reason: module.metadata.state_reason,
          date: module.last_activity || new Date().toISOString()
        })
      }
    })
    
    return decisions
  }
  
  /**
   * Extract generated documents from module outputs
   */
  private static extractDocuments(modules: ModuleActivation[]): string[] {
    const documents: string[] = []
    
    modules.forEach(module => {
      if (module.outputs?.documents) {
        documents.push(...module.outputs.documents)
      }
      
      // Add default documents based on completed modules
      const moduleDef = getModuleById(module.module_id)
      if (module.status === 'completed' && moduleDef?.metadata?.outputDocuments) {
        documents.push(...moduleDef.metadata.outputDocuments)
      }
    })
    
    return [...new Set(documents)] // Remove duplicates
  }
  
  /**
   * Extract branding outputs
   */
  private static extractBrandingOutputs(modules: ModuleActivation[]): UserContext['outputs']['branding'] {
    const brandingModule = modules.find(m => m.module_id === 'MOD_301')
    
    if (!brandingModule || brandingModule.status !== 'completed') {
      return { logo_generated: false }
    }
    
    return {
      logo_generated: true,
      colors: brandingModule.outputs?.colors || ['#6ad040', '#161616'],
      brand_name: brandingModule.outputs?.brand_name
    }
  }
  
  /**
   * Extract website outputs
   */
  private static extractWebsiteOutputs(modules: ModuleActivation[]): UserContext['outputs']['website'] {
    const websiteModule = modules.find(m => m.module_id === 'MOD_501')
    
    if (!websiteModule) {
      return { status: 'not_started' }
    }
    
    return {
      domain: websiteModule.outputs?.domain,
      status: websiteModule.status === 'completed' ? 'live' : 
              websiteModule.status === 'active' ? 'in_progress' : 'not_started'
    }
  }
  
  /**
   * Simple browser-compatible hash function
   */
  private static simpleHash(str: string): string {
    let hash = 0
    if (str.length === 0) return hash.toString(16)
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0')
  }

  /**
   * Generate YAML from context object
   */
  private static generateYAML(context: UserContext): string {
    const yaml = `USER_CONTEXT:
  # Basic Information
  user_id: "${context.user_id}"
  name: "${context.name}"
  email: "${context.email}"
  joined_date: "${context.joined_date}"
  
  # Business Profile
  business:
    name: "${context.business.name || 'Not set'}"
    industry: "${context.business.industry || 'Not specified'}"
    legal_structure: "${context.business.legal_structure || 'Not decided'}"
    state: "${context.business.state || 'Not specified'}"
    stage: "${context.business.stage || 'Just Starting'}"
    description: "${context.business.description || 'Not provided'}"
    target_audience: "${context.business.target_audience || 'Not defined'}"
    business_model: "${context.business.business_model || 'Not specified'}"
    business_type: "${context.business.business_type || 'Not selected'}"
    time_commitment: "${context.business.time_commitment || 'Not specified'}"
    capital_level: "${context.business.capital_level || 'Not specified'}"
    
  # Progress & Achievements
  progress:
    profile_completion: ${context.progress.profile_completion}%
    modules_completed: [${context.progress.modules_completed.map(m => `"${m}"`).join(', ')}]
    modules_active: [${context.progress.modules_active.map(m => `"${m}"`).join(', ')}]
    total_tasks_completed: ${context.progress.total_tasks_completed}
    last_activity: "${context.progress.last_activity}"
    
  # Key Decisions Made
  decisions:${context.decisions.length === 0 ? '\n    - None recorded' : ''}
${context.decisions.map(d => `    - type: "${d.type}"
      choice: "${d.choice}"
      reason: "${d.reason || 'Not specified'}"
      date: "${d.date}"`).join('\n')}
      
  # Generated Outputs
  outputs:
    documents:${context.outputs.documents.length === 0 ? '\n      - None generated' : ''}
${context.outputs.documents.map(d => `      - "${d}"`).join('\n')}
    branding:
      logo_generated: ${context.outputs.branding?.logo_generated || false}
      colors: [${context.outputs.branding?.colors?.map(c => `"${c}"`).join(', ') || ''}]
      brand_name: "${context.outputs.branding?.brand_name || 'Not set'}"
    website:
      domain: "${context.outputs.website?.domain || 'Not registered'}"
      status: "${context.outputs.website?.status || 'not_started'}"
      
  # Preferences & Settings
  preferences:
    communication_style: "${context.preferences.communication_style}"
    time_commitment: "${context.preferences.time_commitment || 'Not specified'}"
    capital_available: "${context.preferences.capital_available || 'Not specified'}"
    stealth_mode: ${context.preferences.stealth_mode}
    language: "${context.preferences.language}"
    region: "${context.preferences.region || 'Not specified'}"
    
  # Conversation Insights
  conversation_history:
    total_messages: ${context.conversation_history.total_messages}
    common_topics: [${context.conversation_history.common_topics.map(t => `"${t}"`).join(', ')}]
    last_conversation: "${context.conversation_history.last_conversation || 'Never'}"
    key_questions_asked:${context.conversation_history.key_questions_asked.length === 0 ? '\n      - None recorded' : ''}
${context.conversation_history.key_questions_asked.map(q => `      - "${q}"`).join('\n')}`
    
    return yaml
  }
}