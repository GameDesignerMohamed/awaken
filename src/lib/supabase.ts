import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const MOCK_MODE = !supabaseUrl || !supabaseAnonKey

// In mock mode, create a dummy client that won't be used
// Pages check MOCK_MODE and use mock data instead
export const supabase: SupabaseClient = MOCK_MODE
  ? (null as unknown as SupabaseClient)
  : createClient(supabaseUrl, supabaseAnonKey)
