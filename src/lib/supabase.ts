import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Lead {
  id: string
  email: string | null
  created_at: string
}

export interface Profile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  customer_id: string | null
  price_id: string | null
  has_access: boolean | null
  created_at: string | null
  updated_at: string | null
}