import { supabase } from '../supabase'
import type { Database } from '../../types/supabase'

type ChatConversation = Database['public']['Tables']['chat_conversations']['Row']
type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
type ChatMemory = Database['public']['Tables']['chat_memory']['Row']

export interface CreateConversationParams {
  title?: string
  metadata?: Record<string, any>
}

export interface CreateMessageParams {
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, any>
}

export interface CreateMemoryParams {
  key: string
  value: string
  category?: string
  importance?: number
  expiresAt?: Date
}

class ChatService {
  // Conversation methods
  async createConversation(params: CreateConversationParams = {}) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.user.id,
        title: params.title || 'New Chat',
        metadata: params.metadata || {}
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getConversations(limit = 20, offset = 0) {
    // First try with archived_at column (new schema)
    let { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('is_active', true)
      .is('archived_at', null)
      .order('updated_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    // If archived_at column doesn't exist, fallback to just is_active
    if (error && error.code === '42703') {
      const result = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1)
      
      data = result.data
      error = result.error
    }

    if (error) throw error
    return data || []
  }

  async getConversation(conversationId: string) {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (error) throw error
    return data
  }

  async updateConversation(conversationId: string, updates: Partial<ChatConversation>) {
    const { data, error } = await supabase
      .from('chat_conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteConversation(conversationId: string) {
    // Archive the conversation instead of deleting
    let { error } = await supabase
      .from('chat_conversations')
      .update({ 
        is_active: false,
        archived_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    // If archived_at column doesn't exist, just update is_active
    if (error && error.code === '42703') {
      const result = await supabase
        .from('chat_conversations')
        .update({ 
          is_active: false
        })
        .eq('id', conversationId)
      
      error = result.error
    }

    if (error) throw error
  }

  async restoreConversation(conversationId: string) {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ 
        is_active: true,
        archived_at: null
      })
      .eq('id', conversationId)

    if (error) throw error
  }

  async getArchivedConversations(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('is_active', false)
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }

  // Message methods
  async createMessage(params: CreateMessageParams) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: params.conversationId,
        role: params.role,
        content: params.content,
        metadata: params.metadata || {}
      })
      .select()
      .single()

    if (error) throw error

    // Update conversation's updated_at
    await this.updateConversation(params.conversationId, { 
      updated_at: new Date().toISOString() 
    })

    return data
  }

  async getMessages(conversationId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }

  async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId)

    if (error) throw error
  }

  // Memory methods
  async createOrUpdateMemory(params: CreateMemoryParams) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('chat_memory')
      .upsert({
        user_id: user.user.id,
        key: params.key,
        value: params.value,
        category: params.category || 'general',
        importance: params.importance || 5,
        expires_at: params.expiresAt?.toISOString()
      }, {
        onConflict: 'user_id,key'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getMemory(key: string) {
    const { data, error } = await supabase
      .from('chat_memory')
      .select('*')
      .eq('key', key)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore not found errors
    return data
  }

  async getAllMemory(category?: string) {
    let query = supabase
      .from('chat_memory')
      .select('*')
      .order('importance', { ascending: false })
      .order('updated_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    // Filter out expired memories
    query = query.or('expires_at.is.null,expires_at.gt.now()')

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  async deleteMemory(key: string) {
    const { error } = await supabase
      .from('chat_memory')
      .delete()
      .eq('key', key)

    if (error) throw error
  }

  // Helper methods
  async getOrCreateTodayConversation() {
    // Get today's active conversations
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // First try with archived_at column (new schema)
    let result = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('is_active', true)
      .is('archived_at', null)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    // If archived_at column doesn't exist, fallback to just is_active
    if (result.error && result.error.code === '42703') {
      result = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('is_active', true)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
    }

    const conversations = result.data
    if (conversations && conversations.length > 0) {
      return conversations[0]
    }

    // Create new conversation for today
    return this.createConversation({
      title: `Chat - ${new Date().toLocaleDateString()}`,
      metadata: { auto_created: true }
    })
  }

  // Build context from memory for AI
  async buildContextFromMemory(limit = 10): Promise<string> {
    const memories = await this.getAllMemory()
    const topMemories = memories.slice(0, limit)
    
    if (topMemories.length === 0) return ''
    
    const context = topMemories
      .map(m => `${m.key}: ${m.value}`)
      .join('\n')
    
    return `User Context:\n${context}`
  }

  // Extract and save important information from conversations
  async extractMemoryFromConversation(conversationId: string) {
    const messages = await this.getMessages(conversationId, 100)
    
    // Simple extraction - you can enhance this with AI
    const userMessages = messages.filter(m => m.role === 'user')
    
    // Extract potential memories (this is a simple implementation)
    for (const message of userMessages) {
      const content = message.content.toLowerCase()
      
      // Extract name
      const nameMatch = content.match(/my name is (\w+)/i)
      if (nameMatch) {
        await this.createOrUpdateMemory({
          key: 'user_name',
          value: nameMatch[1],
          category: 'personal',
          importance: 8
        })
      }
      
      // Extract preferences
      if (content.includes('i prefer') || content.includes('i like')) {
        const preferenceMatch = content.match(/i (?:prefer|like) (.+?)(?:\.|,|$)/i)
        if (preferenceMatch) {
          await this.createOrUpdateMemory({
            key: `preference_${Date.now()}`,
            value: preferenceMatch[1],
            category: 'preferences',
            importance: 6
          })
        }
      }
      
      // Extract business info
      if (content.includes('my business') || content.includes('my company')) {
        const businessMatch = content.match(/my (?:business|company) (.+?)(?:\.|,|$)/i)
        if (businessMatch) {
          await this.createOrUpdateMemory({
            key: 'business_info',
            value: businessMatch[1],
            category: 'business',
            importance: 9
          })
        }
      }
    }
  }
}

export const chatService = new ChatService()