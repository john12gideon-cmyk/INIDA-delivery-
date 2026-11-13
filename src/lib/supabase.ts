import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config } from './config'

let client: SupabaseClient | null = null

/** Lazily created so the storefront still renders without Supabase env vars. */
export function getSupabase(): SupabaseClient {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).')
  }
  client ??= createClient(config.supabaseUrl, config.supabaseAnonKey)
  return client
}
