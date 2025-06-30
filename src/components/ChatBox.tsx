import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { mistralAI, type MistralMessage, type BusinessIntent } from '../lib/mistral'
import { useApp } from '../contexts/AppContext'
import { useUserProfile } from '../hooks/useUserProfile'
import { trackEvent } from '../lib/analytics'
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
  MessageSquare
} from 'lucide-react'

interface ChatMessage extends MistralMessage {
  id: string
  timestamp: Date
  intent?: BusinessIntent
}

interface ChatBoxProps {
  className?: string
}

export const ChatBox: React.FC<ChatBoxProps> = ({ className = '' }) => {
  const { user, setAppMode, appMode } = useApp()
  const { profile, createBusinessProfile } = useUserProfile()
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hey there, future CEO! I'm the BasedSigma AI Agent, your business automation partner. What's your vision? I can help you start a business, handle legal paperwork, create branding, build websites, set up payments, or automate marketing. Let's turn your ideas into reality! 💪",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Track chat interaction with profile context
    trackEvent('chat_interaction', {
      message_type: 'user_message',
      message_length: inputValue.length,
      user_authenticated: !!user,
      has_profile: !!profile,
      profile_completion: profile?.completion_percentage || 0
    })

    try {
      // Analyze intent
      const intent = mistralAI.analyzeIntent(inputValue)
      
      // Get AI response with profile context
      const contextualMessages = [
        ...messages.slice(-5), // Keep last 5 messages for context
        userMessage
      ]

      // Add profile context to the conversation if available
      if (profile && profile.completion_percentage && profile.completion_percentage > 0) {
        const businessProfile = createBusinessProfile()
        const profileContext = `User Profile Context: Name: ${profile.name || 'Not set'}, Business Type: ${profile.business_type || 'Not set'}, Region: ${profile.region || 'Not set'}, Time Commitment: ${profile.time_commitment || 'Not set'}, Capital Level: ${profile.capital_level || 'Not set'}, Completion: ${profile.completion_percentage}%. Business Profile: ${JSON.stringify(businessProfile)}`
        
        contextualMessages.unshift({
          id: 'context',
          role: 'system',
          content: profileContext,
          timestamp: new Date()
        })
      }
      
      const aiResponse = await mistralAI.chat(contextualMessages)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        intent
      }

      setMessages(prev => [...prev, assistantMessage])

      // Track AI response and intent
      trackEvent('chat_ai_response', {
        intent_type: intent.type,
        intent_confidence: intent.confidence,
        response_length: aiResponse.length,
        profile_completion: profile?.completion_percentage || 0
      })

      // Auto-trigger actions based on high-confidence intents
      if (intent.confidence > 0.8 && user) {
        handleIntentAction(intent)
      }

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. But hey, that's what makes us stronger! Try asking me again, and let's get your business automated! 💪",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
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
      case 'start_legal_setup':
      case 'start_branding_process':
      case 'start_website_builder':
      case 'setup_payment_processing':
      case 'setup_business_banking':
      case 'start_marketing_automation':
        if (user) {
          setAppMode({ isAppMode: true, hasAccess: true })
          trackEvent('chat_action_triggered', { action: intent.action })
        }
        break
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getProfileCompletionStatus = () => {
    if (!profile) return { percentage: 0, message: 'Profile not created', ready: false }
    
    const completion = profile.completion_percentage || 0
    if (completion < 50) return { percentage: completion, message: 'Profile incomplete', ready: false }
    if (completion < 80) return { percentage: completion, message: 'Almost ready', ready: false }
    return { percentage: completion, message: 'Profile complete', ready: true }
  }

  const profileStatus = getProfileCompletionStatus()

  // Don't render ChatBox if user is not logged in
  if (!user) {
    return null
  }

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] shadow-2xl hover:shadow-[#6ad040]/50 transition-all duration-300 hover:scale-110 group"
        >
          <div className="relative">
            <img src="/sigmaguy-black.svg" alt="BasedSigma AI" className="w-10 h-10" />
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-[#161616] animate-pulse" />
          </div>
        </Button>
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
      <Card className={`bg-black/90 backdrop-blur-md border border-[#6ad040]/40 shadow-2xl shadow-[#6ad040]/20 w-full h-full transition-all duration-500 ${
        isMaximized ? 'rounded-none' : 'rounded-2xl'
      }`}>
        <CardContent className="p-0 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#6ad040]/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/sigmaguy.svg" alt="BasedSigma AI" className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-sm">
                  BASEDSIGMA AI AGENT
                </h3>
                <p className="font-['Space_Mono'] text-[#6ad040] text-xs">
                  Business Automation Assistant
                </p>
              </div>
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
            <div className="px-4 py-2 bg-black/40 border-b border-[#6ad040]/20 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6ad040] rounded-full animate-pulse" />
                  <span className="font-['Space_Mono'] text-[#b7ffab] text-xs">
                    {profile?.name || 'Sigma User'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-[#6ad040]" />
                    <span className="font-['Space_Mono'] text-[#6ad040] text-xs">
                      DB
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Settings className="w-3 h-3 text-[#6ad040]" />
                    <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                      {profileStatus.percentage}%
                    </span>
                  </div>
                  {profileStatus.ready && (
                    <Button
                      onClick={() => setAppMode({ isAppMode: true, hasAccess: true })}
                      className="text-xs px-2 py-1 h-auto bg-[#6ad040] hover:bg-[#79e74c] text-[#161616]"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Automate
                    </Button>
                  )}
                </div>
              </div>
              {!profileStatus.ready && (
                <div className="mt-1">
                  <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-500"
                      style={{ width: `${profileStatus.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages Container - Fixed height with proper overflow */}
          <div className="flex-1 min-h-0 relative">
            <div className={`h-full overflow-y-auto overflow-x-hidden px-4 py-4 ${
              isMaximized ? 'max-w-4xl mx-auto' : ''
            }`}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 flex-shrink-0 mt-1">
                      {message.role === 'assistant' ? (
                        <img src="/sigmaguy.svg" alt="BasedSigma AI" className="w-8 h-8" />
                      ) : (
                        <div className="w-8 h-8 bg-[#b7ffab] rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-[#161616]" />
                        </div>
                      )}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className="flex-1 min-w-0 max-w-[calc(100%-3rem)]">
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-[#6ad040] text-[#161616] rounded-tr-md ml-auto max-w-[85%]'
                            : 'bg-black/40 border border-[#6ad040]/30 text-[#b7ffab] rounded-tl-md max-w-[95%]'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <p className="text-sm leading-relaxed font-['Space_Mono'] break-words">
                            {message.content}
                          </p>
                        ) : (
                          <div className="text-sm leading-relaxed font-['Space_Mono'] break-words prose prose-sm prose-invert max-w-none [&>*]:break-words">
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
                                    <code className="bg-black/50 px-1 py-0.5 rounded text-[#6ad040] text-xs break-all">{children}</code>
                                  ) : (
                                    <code className="block bg-black/50 p-2 rounded text-[#6ad040] text-xs overflow-x-auto break-all">{children}</code>
                                  ),
                                pre: ({ children }) => <pre className="bg-black/50 p-3 rounded mb-2 overflow-x-auto">{children}</pre>,
                                blockquote: ({ children }) => <blockquote className="border-l-2 border-[#6ad040] pl-3 my-2">{children}</blockquote>,
                                h1: ({ children }) => <h1 className="text-lg font-bold text-[#6ad040] mb-2 break-words">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-bold text-[#6ad040] mb-2 break-words">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-bold text-[#6ad040] mb-2 break-words">{children}</h3>,
                                a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#6ad040] underline hover:text-[#79e74c] break-all">{children}</a>,
                                hr: () => <hr className="border-[#6ad040]/30 my-3" />,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                      
                      {/* Message metadata */}
                      <div className={`flex items-center gap-2 mt-1 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.intent && message.intent.confidence > 0.8 && (
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-[#6ad040]" />
                            <span className="font-['Space_Mono'] text-[#6ad040] text-xs font-bold">
                              {message.intent.type.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 flex-shrink-0 mt-1">
                      <img src="/sigmaguy.svg" alt="BasedSigma AI" className="w-8 h-8" />
                    </div>
                    <div className="bg-black/40 border border-[#6ad040]/30 px-4 py-3 rounded-2xl rounded-tl-md">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-[#6ad040] animate-spin" />
                        <span className="font-['Space_Mono'] text-[#b7ffab] text-sm">
                          BasedSigma is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Actions */}
          {user && !profileStatus.ready && (
            <div className="px-4 py-2 border-t border-[#6ad040]/20 flex-shrink-0">
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setInputValue("Help me complete my profile")
                    handleSendMessage()
                  }}
                  className="text-xs px-3 py-1 h-auto bg-[#6ad040]/20 hover:bg-[#6ad040]/30 text-[#6ad040] border border-[#6ad040]/50"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Complete Profile
                </Button>
                <Button
                  onClick={() => {
                    setInputValue("What can you automate for my business?")
                    handleSendMessage()
                  }}
                  className="text-xs px-3 py-1 h-auto bg-[#6ad040]/20 hover:bg-[#6ad040]/30 text-[#6ad040] border border-[#6ad040]/50"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Show Features
                </Button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-[#6ad040]/20 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask BasedSigma anything about your business..."
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
            
            {!user && (
              <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs mt-2 text-center">
                Sign up to unlock full automation features
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}