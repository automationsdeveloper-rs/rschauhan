import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

/** null when env vars are missing → the app runs in demo mode on local seed data. */
export const supabase = url && key ? createClient(url, key) : null
export const isDemo = !supabase
export const supabaseConfig = { url, key }
