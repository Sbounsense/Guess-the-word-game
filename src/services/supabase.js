import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured =
  url && key &&
  !url.includes('your-project-id') &&
  !key.includes('your-anon-key')

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder'
)
