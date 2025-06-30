import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { useApp } from '../contexts/AppContext'
import { useUserProfile } from '../hooks/useUserProfile'
import { useChatWithMemory } from '../hooks/useChatWithMemory'
import { usePageContext } from '../hooks/usePageContext'
import { useFormContext } from '../contexts/FormContext'
import { trackEvent } from '../lib/analytics'
import { mistralAI, type BusinessIntent } from '../lib/mistral'
import { generateAutoFillPrompt as generateAIAutoFillPrompt, type SuggestionContext } from '../lib/openai'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2, 
  X,
  Zap,
  Loader2,
  Sparkles,
  Settings,
  FileText,
  Database,
  MessageSquare,
  Plus,
  Archive,
  Clock,
  ChevronLeft,
  ChevronRight,
  Brain,
  ArrowRight
} from 'lucide-react'

interface ChatBoxProps {
  className?: string
}

export const ChatBoxWithMemory: React.FC<ChatBoxProps> = ({ className = '' }) => {
  const { user, setAppMode, appMode } = useApp()
  const { profile, createBusinessProfile } = useUserProfile()
  const pageContext = usePageContext()
  const { isAutoFilling } = useFormContext()
  const {
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
    refreshConversations
  } = useChatWithMemory()
  
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) {
        toggleMaximize()
      }
    }
    
    if (isMaximized) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isMaximized])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return
    
    // Enhance the message with page context
    const enhancedMessage = inputValue
    
    // Analyze intent
    const intent = mistralAI.analyzeIntent(inputValue)
    
    // Track interaction
    trackEvent('chat_interaction', {
      message_type: 'user_message',
      message_length: inputValue.length,
      user_authenticated: !!user,
      has_profile: !!profile,
      profile_completion: profile?.completion_percentage || 0,
      has_memory: !!memory,
      page_context: pageContext.pageName,
      used_suggestion: pageContext.suggestions.includes(inputValue)
    })
    
    // Send message with enhanced context
    await sendMessage(enhancedMessage)
    setInputValue('')
    
    // Handle intent actions
    if (intent.confidence > 0.8 && user) {
      handleIntentAction(intent)
    }
  }

  const handleIntentAction = (intent: BusinessIntent) => {
    switch (intent.action) {
      case 'complete_profile_setup':
        if (user && !appMode.isAppMode) {
          setAppMode({ isAppMode: true, hasAccess: true })
          trackEvent('chat_action_triggered', { action: 'enter_app_profile' })
        }
        break
      case 'start_onboarding_process':
        if (user) {
          setAppMode({ isAppMode: true, hasAccess: true })
          trackEvent('chat_action_triggered', { action: 'enter_app' })
        }
        break
      default:
        if (user && intent.action.startsWith('start_') || intent.action.startsWith('setup_')) {
          setAppMode({ isAppMode: true, hasAccess: true })
          trackEvent('chat_action_triggered', { action: intent.action })
        }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else if (e.key === '/' && e.ctrlKey) {
      e.preventDefault()
      setShowSuggestions(!showSuggestions)
    }
  }

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleNewChat = async () => {
    await createNewConversation()
    // No need to load a conversation since it doesn't exist yet
    // It will be created when the user sends their first message
  }

  const getProfileCompletionStatus = () => {
    if (!profile) return { percentage: 0, message: 'Profile not created', ready: false }
    
    const completion = profile.completion_percentage || 0
    if (completion < 50) return { percentage: completion, message: 'Profile incomplete', ready: false }
    if (completion < 80) return { percentage: completion, message: 'Almost ready', ready: false }
    return { percentage: completion, message: 'Profile complete', ready: true }
  }

  const profileStatus = getProfileCompletionStatus()

  // Generate intelligent auto-fill prompts based on module
  const generateAutoFillPrompt = (context: typeof pageContext) => {
    const businessName = profile?.business_info?.business_name || profile?.name || 'my business'
    
    switch (context.moduleType) {
      case 'legal':
        return `Please help me complete the legal setup form. Analyze my business profile and suggest the best legal structure, generate all required legal documents including operating agreement, bylaws, and incorporation documents. Also prepare my EIN application and state registration. Business name: ${businessName}`
      
      case 'branding':
        return `Create a complete brand identity package for ${businessName}. Generate logo concepts, color palettes, typography recommendations, brand voice guidelines, and business card designs. Make it professional and aligned with my industry.`
      
      case 'banking':
        return `Help me set up business banking for ${businessName}. Compare the best business checking accounts, prepare all required documents, and guide me through the application process. Also recommend business credit cards.`
      
      case 'website':
        return `Build a professional website structure for ${businessName}. Create homepage copy, about us content, service descriptions, and SEO-optimized pages. Include call-to-action buttons and conversion-focused design.`
      
      case 'marketing':
        return `Create a complete marketing strategy for ${businessName}. Generate a 30-day social media calendar, email sequences, content ideas, and customer acquisition strategies. Make it actionable and easy to implement.`
      
      case 'payment':
        return `Set up payment processing for ${businessName}. Compare Stripe vs Square vs PayPal, help me choose the best option, and guide me through integration. Also create professional invoice templates.`
      
      default:
        return `Help me complete the ${context.pageName} setup by analyzing my needs and auto-filling all required information with intelligent suggestions.`
    }
  }

  // Don't render ChatBox if user is not logged in
  if (!user) {
    return null
  }

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] shadow-2xl hover:shadow-[#6ad040]/50 transition-all duration-300 hover:scale-110 group"
          >
            <div className="relative">
              <img src="/sigmaguy-black.svg" alt="BasedSigma AI" className="w-10 h-10" />
              <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-[#161616] animate-pulse" />
            </div>
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              handleNewChat()
              setIsOpen(true)
            }}
            className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-black border border-[#6ad040]/40 hover:bg-[#6ad040]/20 text-[#6ad040] shadow-lg transition-all duration-300 hover:scale-110 p-0"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`fixed z-50 transition-all duration-500 ease-in-out ${className}`}
      style={{
        right: isMaximized ? '0' : '24px',
        bottom: isMaximized ? '0' : '24px',
        left: isMaximized ? '0' : 'auto',
        top: isMaximized ? '0' : 'auto',
        width: isMaximized ? '100vw' : '384px',
        height: isMaximized ? '100vh' : '600px'
      }}
    >
        <div className={`bg-black/90 backdrop-blur-md border border-[#6ad040]/40 shadow-2xl shadow-[#6ad040]/20 w-full h-full transition-all duration-500 ${
          isMaximized ? 'rounded-none' : 'rounded-2xl'
        } flex overflow-hidden`}>
          
          {/* Sidebar for conversation history (only in maximized mode) */}
          {isMaximized && showSidebar && (
            <div className="w-80 border-r border-[#6ad040]/20 flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-[#6ad040]/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-sm">
                    Chat History
                  </h3>
                  <Button
                    onClick={handleNewChat}
                    className="p-2 bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] rounded-lg transition-all duration-300 hover:scale-105"
                    title="New Chat"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {memory && (
                  <div className="mb-2 p-2 bg-[#6ad040]/10 rounded-lg border border-[#6ad040]/20">
                    <div className="flex items-center gap-2 text-[#6ad040] text-xs mb-1">
                      <Brain className="w-3 h-3" />
                      <span className="font-['Space_Mono'] font-bold">Memory Active</span>
                    </div>
                    <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-xs">
                      I remember your preferences
                    </p>
                  </div>
                )}
              </div>
              
              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto p-2">
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-[#6ad040] animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-sm">
                      No conversations yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 group cursor-pointer ${
                          currentConversation?.id === conv.id
                            ? 'bg-[#6ad040]/20 border border-[#6ad040]/40'
                            : 'hover:bg-[#6ad040]/10'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div 
                            className="flex-1 min-w-0"
                            onClick={() => loadConversation(conv.id)}
                          >
                            <p className="font-['Space_Grotesk'] text-[#b7ffab] text-sm font-bold truncate">
                              {conv.title}
                            </p>
                            <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs mt-1">
                              {formatDate(conv.updated_at)}
                            </p>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteConversation(conv.id)
                            }}
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#b7ffab]/40"
                            title="Archive conversation"
                            style={{ pointerEvents: 'auto' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Archive className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#6ad040]/20">
                <div className="flex items-center gap-3">
                  {isMaximized && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSidebar(!showSidebar)}
                      className="p-2 text-[#b7ffab] hover:text-[#6ad040] hover:bg-[#6ad040]/10"
                    >
                      {showSidebar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  )}
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img src="/sigmaguy.svg" alt="BasedSigma AI" className="w-10 h-10" />
                  </div>
                  <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-sm">
                    BASEDSIGMA AI AGENT
                  </h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMaximize}
                    className="w-8 h-8 p-0 text-[#b7ffab] hover:text-[#6ad040] hover:bg-[#6ad040]/10"
                    title={isMaximized ? "Exit fullscreen" : "Maximize for full engagement"}
                  >
                    {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 p-0 text-[#b7ffab] hover:text-red-400 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* User Status Bar */}
              {user && (
                <div className="px-4 py-2 bg-black/40 border-b border-[#6ad040]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#6ad040] rounded-full animate-pulse" />
                      <span className="font-['Space_Mono'] text-[#b7ffab] text-xs truncate max-w-[120px]">
                        {currentConversation?.title || 'New Conversation'}
                      </span>
                    </div>
                    {profileStatus.ready || !profileStatus.ready ? (
                      <Button
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className={`text-xs px-3 py-1 h-auto rounded-full transition-all ${
                          showSuggestions 
                            ? 'bg-[#6ad040] text-[#161616]' 
                            : 'bg-[#6ad040]/20 hover:bg-[#6ad040]/30 text-[#6ad040] border border-[#6ad040]/50'
                        }`}
                        title="Smart suggestions"
                      >
                        <Zap className="w-3 h-3" />
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-500"
                            style={{ width: `${profileStatus.percentage}%` }}
                          />
                        </div>
                        <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                          {profileStatus.percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Auto-fill Indicator */}
              {isAutoFilling && (
                <div className="mx-4 mb-2">
                  <div className="bg-[#6ad040]/20 border border-[#6ad040] rounded-lg p-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6ad040] animate-pulse" />
                    <span className="font-['Space_Mono'] text-[#6ad040] text-sm">
                      AI is filling out your form...
                    </span>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className={`flex-1 overflow-y-auto overflow-x-hidden min-h-0 ${
                isMaximized ? 'max-w-4xl mx-auto w-full' : ''
              }`}>
                <div className="p-4 space-y-4 pb-8">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center min-h-[300px]">
                      <img src="/sigmaguy.svg" alt="BasedSigma AI" className="w-24 h-24 mb-4" />
                      <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg mb-2">
                        Start a conversation
                      </h3>
                      <p className="font-['Space_Mono'] text-[#b7ffab]/70 text-sm">
                        I'm the BasedSigma AI Agent, here to help you build your business empire
                      </p>
                    </div>
                  ) : (
                    <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                            <img src="/sigmaguy.svg" alt="BasedSigma AI" className="w-8 h-8" />
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] min-w-0 ${message.role === 'user' ? 'order-1' : ''}`}>
                          <div
                            className={`p-3 rounded-2xl overflow-hidden max-w-full ${
                              message.role === 'user'
                                ? 'bg-[#6ad040] text-[#161616] rounded-br-md'
                                : 'bg-black/40 border border-[#6ad040]/30 text-[#b7ffab] rounded-bl-md'
                            }`}
                          >
                            {message.role === 'user' ? (
                              <p className="text-sm leading-relaxed break-words font-['Space_Mono']">
                                {message.content}
                              </p>
                            ) : (
                              <div className="text-sm leading-relaxed break-words font-['Space_Mono'] prose prose-sm prose-invert max-w-none [&>*]:break-words">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 break-words">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 break-words">{children}</ol>,
                                    li: ({ children }) => <li className="text-[#b7ffab] break-words">{children}</li>,
                                    strong: ({ children }) => <strong className="font-bold text-[#6ad040]">{children}</strong>,
                                    em: ({ children }) => <em className="italic">{children}</em>,
                                    code: ({ inline, children }) => 
                                      inline ? (
                                        <code className="bg-black/50 px-1 py-0.5 rounded text-[#6ad040] text-xs break-words">{children}</code>
                                      ) : (
                                        <code className="block bg-black/50 p-2 rounded text-[#6ad040] text-xs overflow-x-auto break-words">{children}</code>
                                      ),
                                    pre: ({ children }) => <pre className="bg-black/50 p-3 rounded mb-2 overflow-x-auto whitespace-pre-wrap break-words">{children}</pre>,
                                    blockquote: ({ children }) => <blockquote className="border-l-2 border-[#6ad040] pl-3 my-2 break-words">{children}</blockquote>,
                                    h1: ({ children }) => <h1 className="text-lg font-bold text-[#6ad040] mb-2 break-words">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-base font-bold text-[#6ad040] mb-2 break-words">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-sm font-bold text-[#6ad040] mb-2 break-words">{children}</h3>,
                                    a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#6ad040] underline hover:text-[#79e74c] break-words">{children}</a>,
                                    hr: () => <hr className="border-[#6ad040]/30 my-3" />,
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                          
                          <div className={`flex items-center gap-2 mt-1 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs">
                              {formatTime(message.timestamp)}
                            </span>
                            {(message as any).intent && (message as any).intent.confidence > 0.8 && (
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-[#6ad040]" />
                                <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                                  {(message as any).intent.type.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {message.role === 'user' && (
                          <div className="w-8 h-8 bg-[#b7ffab] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-4 h-4 text-[#161616]" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                          <img src="/sigmaguy.svg" alt="BasedSigma AI" className="w-8 h-8" />
                        </div>
                        <div className="bg-black/40 border border-[#6ad040]/30 p-3 rounded-2xl rounded-bl-md">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#6ad040] animate-spin" />
                            <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                              BasedSigma is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </>
                )}
                </div>
              </div>

              {/* Smart Suggestions */}
              {showSuggestions && (
                <div className="px-4 py-3 border-t border-[#6ad040]/20 bg-black/20">
                  
                  {/* Auto-Fill Magic Button for forms */}
                  {pageContext.moduleType && pageContext.pageType === 'automation' && (
                    <Button
                      onClick={async () => {
                        setIsLoading(true)
                        try {
                          // Use AI to generate a context-aware auto-fill prompt
                          const suggestionContext: SuggestionContext = {
                            pageName: pageContext.pageName,
                            pageType: pageContext.pageType,
                            moduleType: pageContext.moduleType,
                            userProfile: {
                              name: profile?.name,
                              email: user?.email,
                              businessInfo: {
                                businessName: profile?.business_info?.business_name,
                                industry: profile?.business_info?.industry,
                                legalStructure: profile?.business_info?.legal_structure,
                                state: profile?.business_info?.state,
                                description: profile?.business_info?.description,
                                targetAudience: profile?.business_info?.target_audience,
                                businessStage: profile?.business_info?.stage
                              },
                              completion: profile?.completion_percentage
                            }
                          }
                          
                          const autoFillPrompt = import.meta.env.VITE_OPENAI_API_KEY 
                            ? await generateAIAutoFillPrompt(suggestionContext)
                            : generateAutoFillPrompt(pageContext)
                            
                          setInputValue(autoFillPrompt)
                          setShowSuggestions(false)
                          handleSendMessage()
                        } catch (error) {
                          console.error('Failed to generate auto-fill prompt:', error)
                          // Fallback to local generation
                          const autoFillPrompt = generateAutoFillPrompt(pageContext)
                          setInputValue(autoFillPrompt)
                          setShowSuggestions(false)
                          handleSendMessage()
                        } finally {
                          setIsLoading(false)
                        }
                      }}
                      disabled={isLoading}
                      className="w-full mb-3 text-xs px-3 py-3 h-auto bg-gradient-to-r from-[#6ad040] to-[#79e74c] hover:from-[#79e74c] hover:to-[#88f65b] text-[#161616] font-bold justify-center items-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Auto-Fill This Form with AI</span>
                          <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-1 gap-2 mb-2">
                    {pageContext.isLoadingSuggestions ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 text-[#6ad040] animate-spin mr-2" />
                        <span className="font-['Space_Mono'] text-[#6ad040] text-xs">
                          AI is analyzing your context...
                        </span>
                      </div>
                    ) : (
                      pageContext.suggestions.slice(0, 4).map((suggestion, index) => (
                        <Button
                          key={index}
                          onClick={() => {
                            setInputValue(suggestion)
                            setShowSuggestions(false)
                            handleSendMessage()
                          }}
                          className="text-xs px-3 py-3 min-h-[2.5rem] bg-[#6ad040]/10 hover:bg-[#6ad040]/20 text-[#b7ffab] border border-[#6ad040]/30 justify-start text-left group whitespace-normal"
                        >
                          <span className="flex-1 leading-relaxed">{suggestion}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                        </Button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-[#6ad040]/20">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={showSuggestions ? "Choose a suggestion or type your own..." : "Ask BasedSigma anything... (Ctrl+/ for suggestions)"}
                    disabled={isLoading}
                    className="flex-1 bg-black/40 border-[#6ad040]/50 text-[#b7ffab] placeholder:text-[#b7ffab]/60 focus:border-[#6ad040] focus:ring-[#6ad040]/30"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] px-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
          </div>
        </div>
    </div>
  )
}