import { useState, useCallback, useEffect } from 'react'
import { mistralAI, type MistralMessage } from '../lib/mistral'
import { chatService } from '../lib/api/chatService'
import { useApp } from '../contexts/AppContext'

interface ChatMessage extends MistralMessage {
  id: string
  timestamp: Date
  conversationId?: string
}

interface ChatConversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  is_active: boolean
  metadata: Record<string, any>
}

export const useChatWithMemory = () => {
  const { user } = useApp()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [memory, setMemory] = useState<string>('')

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations()
      loadMemoryContext()
    }
  }, [user])

  // Load user's conversations
  const loadConversations = async () => {
    if (!user) return
    
    setIsLoadingConversations(true)
    try {
      const data = await chatService.getConversations()
      setConversations(data)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  // Load memory context
  const loadMemoryContext = async () => {
    if (!user) return
    
    try {
      const context = await chatService.buildContextFromMemory()
      setMemory(context)
    } catch (error) {
      console.error('Error loading memory:', error)
    }
  }

  // Create or get today's conversation
  const initializeConversation = async () => {
    if (!user) return null
    
    try {
      const conversation = await chatService.getOrCreateTodayConversation()
      setCurrentConversation(conversation)
      return conversation
    } catch (error) {
      console.error('Error initializing conversation:', error)
      return null
    }
  }

  // Load messages for a conversation
  const loadConversation = async (conversationId: string) => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const [conversation, messages] = await Promise.all([
        chatService.getConversation(conversationId),
        chatService.getMessages(conversationId)
      ])
      
      setCurrentConversation(conversation)
      setMessages(messages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        conversationId: msg.conversation_id
      })))
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Send message with persistence
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return
    if (!user) return

    // Ensure we have a conversation
    let conversation = currentConversation
    if (!conversation) {
      conversation = await initializeConversation()
      if (!conversation) return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      conversationId: conversation.id
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Save user message to database
      await chatService.createMessage({
        conversationId: conversation.id,
        role: 'user',
        content: content.trim()
      })

      // Build context with memory
      const contextMessages = [
        ...(memory ? [{ role: 'system' as const, content: memory }] : []),
        ...messages.slice(-5), // Keep last 5 messages for context
        userMessage
      ]

      // Get AI response
      const response = await mistralAI.chat(contextMessages)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        conversationId: conversation.id
      }

      setMessages(prev => [...prev, assistantMessage])

      // Save assistant message to database
      await chatService.createMessage({
        conversationId: conversation.id,
        role: 'assistant',
        content: response
      })

      // Extract memory from conversation asynchronously
      chatService.extractMemoryFromConversation(conversation.id).catch(console.error)

      // Update conversation title if it's the first real exchange
      if (messages.length <= 1) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
        await chatService.updateConversation(conversation.id, { title })
      }

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages, currentConversation, user, memory])

  // Create new conversation
  const createNewConversation = async () => {
    if (!user) return
    
    try {
      const conversation = await chatService.createConversation({
        title: 'New Chat',
        metadata: { manual: true }
      })
      setCurrentConversation(conversation)
      setMessages([])
      await loadConversations() // Refresh conversations list
      return conversation
    } catch (error) {
      console.error('Error creating conversation:', error)
      return null
    }
  }

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    if (!user) return
    
    try {
      await chatService.deleteConversation(conversationId)
      await loadConversations()
      
      // If we deleted the current conversation, clear it
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  // Clear current conversation
  const clearMessages = useCallback(() => {
    setMessages([])
    setCurrentConversation(null)
  }, [])

  // Save memory item
  const saveMemory = async (key: string, value: string, category?: string, importance?: number) => {
    if (!user) return
    
    try {
      await chatService.createOrUpdateMemory({
        key,
        value,
        category,
        importance
      })
      await loadMemoryContext() // Refresh memory
    } catch (error) {
      console.error('Error saving memory:', error)
    }
  }

  return {
    messages,
    conversations,
    currentConversation,
    isLoading,
    isLoadingConversations,
    memory,
    sendMessage,
    loadConversation,
    createNewConversation,
    deleteConversation,
    clearMessages,
    saveMemory,
    refreshConversations: loadConversations
  }
}