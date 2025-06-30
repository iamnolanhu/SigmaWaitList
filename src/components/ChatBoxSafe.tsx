import React, { useState, useEffect } from 'react'
import { ChatBox } from './ChatBox'
import { ChatBoxWithMemory } from './ChatBoxWithMemory'
import { supabase } from '../lib/supabase'
import { useApp } from '../contexts/AppContext'

interface ChatBoxSafeProps {
  className?: string
}

export const ChatBoxSafe: React.FC<ChatBoxSafeProps> = ({ className }) => {
  const { user } = useApp()
  const [hasDatabase, setHasDatabase] = useState<boolean | null>(null)
  
  useEffect(() => {
    const checkDatabase = async () => {
      if (!user) {
        setHasDatabase(false)
        return
      }
      
      try {
        // Try to query the chat_conversations table
        const { error } = await supabase
          .from('chat_conversations')
          .select('id')
          .limit(1)
        
        // If no error, tables exist
        setHasDatabase(!error)
      } catch (err) {
        console.log('Chat database not ready yet, using fallback')
        setHasDatabase(false)
      }
    }
    
    checkDatabase()
  }, [user])
  
  // Show loading state while checking
  if (hasDatabase === null) {
    return null
  }
  
  // Use memory-enabled chat if database exists, otherwise use regular chat
  return hasDatabase ? (
    <ChatBoxWithMemory className={className} />
  ) : (
    <ChatBox className={className} />
  )
}