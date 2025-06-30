export interface Database {
  public: {
    Tables: {
      chat_conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
          is_active: boolean
          metadata: Record<string, any>
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          metadata?: Record<string, any>
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          metadata?: Record<string, any>
        }
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          metadata?: Record<string, any>
          created_at?: string
        }
      }
      chat_memory: {
        Row: {
          id: string
          user_id: string
          key: string
          value: string
          category: string
          importance: number
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          key: string
          value: string
          category?: string
          importance?: number
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          key?: string
          value?: string
          category?: string
          importance?: number
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
    }
  }
}