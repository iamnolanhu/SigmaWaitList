import { useState, useCallback, useEffect } from 'react'
import { mistralAI, type MistralMessage } from '../lib/mistral'
import { chatService } from '../lib/api/chatService'
import { useApp } from '../contexts/AppContext'
import { useFormContext } from '../contexts/FormContext'
import { useUserContextForAI } from './useUserContext'

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
  const { getFormContext, updateMultipleFields } = useFormContext()
  const { getAIContext, hasContext } = useUserContextForAI()
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
      const now = new Date()
      
      const conversation = await chatService.createConversation({
        title: 'New Conversation',
        metadata: { 
          auto: true,
          timestamp: now.toISOString(),
          date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        }
      })
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

    // Don't create a conversation yet if we don't have one
    let conversation = currentConversation
    const isNewConversation = !conversation

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      conversationId: conversation?.id
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Create conversation if needed (only when we have actual content)
      if (!conversation) {
        conversation = await initializeConversation()
        if (!conversation) {
          throw new Error('Failed to create conversation')
        }
        // Update the user message with the conversation ID
        userMessage.conversationId = conversation.id
      }

      // Save user message to database
      await chatService.createMessage({
        conversationId: conversation.id,
        role: 'user',
        content: content.trim()
      })

      // Build context with memory and user context
      const userContext = getAIContext()
      const systemPrompt = `You are a helpful business automation assistant. Here is the user's current context and information:

${userContext}

${memory ? `\nAdditional Memory Context:\n${memory}` : ''}

Use this information to provide personalized and context-aware responses. Reference specific details about the user's business, progress, and preferences when relevant.`

      const contextMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.slice(-5), // Keep last 5 messages for context
        userMessage
      ]

      // Get form context if available
      const formContext = getFormContext()

      // Get AI response with form context
      const response = await mistralAI.chat(contextMessages, formContext)
      
      // Parse response for form data
      const formDataMatch = response.match(/```json\n([\s\S]*?)\n```/)
      if (formDataMatch) {
        try {
          const jsonData = JSON.parse(formDataMatch[1])
          if (jsonData.formData) {
            // Auto-fill form fields
            updateMultipleFields(jsonData.formData)
          }
        } catch (e) {
          console.error('Failed to parse form data from AI response:', e)
        }
      }

      // If this is a new conversation, generate a better title based on the first exchange
      if (isNewConversation && messages.length === 0) {
        try {
          const titlePrompt = `Based on this user message: "${content.trim()}", generate a very short (3-5 words) conversation title. Return only the title, no quotes or extra text.`
          const generatedTitle = await mistralAI.chat([
            { role: 'system', content: 'You generate very short, descriptive titles for conversations. Return only the title text, no quotes or punctuation.' },
            { role: 'user', content: titlePrompt }
          ])
          
          // Update conversation title
          await chatService.updateConversation(conversation.id, {
            title: generatedTitle.trim().substring(0, 50) // Limit to 50 chars
          })
          
          // Update local state
          setCurrentConversation(prev => prev ? { ...prev, title: generatedTitle.trim() } : null)
          
          // Refresh conversations list to show new title
          await loadConversations()
        } catch (error) {
          console.error('Error generating conversation title:', error)
        }
      }

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

  // Create new conversation (clears current but doesn't save until first message)
  const createNewConversation = async () => {
    if (!user) return
    
    // Just clear the current conversation and messages
    // The actual conversation will be created when the first message is sent
    setCurrentConversation(null)
    setMessages([])
    
    // Return a placeholder to indicate success
    return { id: 'new', title: 'New Conversation' }
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