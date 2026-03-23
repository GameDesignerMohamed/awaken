import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || 'https://vmnqugwsofsjuqutslje.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbnF1Z3dzb2ZzanVxdXRzbGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTc4MzksImV4cCI6MjA4OTgzMzgzOX0.Cy_O_36sKLxsQcdhy1VGqRtqc5unnsGHz-60sT4MZC8'

export const MOCK_MODE = !supabaseUrl || !supabaseAnonKey

// In mock mode, create a dummy client that won't be used
// Pages check MOCK_MODE and use mock data instead
export const supabase: SupabaseClient = MOCK_MODE
  ? (null as unknown as SupabaseClient)
  : createClient(supabaseUrl, supabaseAnonKey)
