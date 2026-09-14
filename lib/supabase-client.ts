/**
 * Client-safe Supabase public client (anon only).
 * Strictly no service-role key here so server admin secrets
 * can never be bundled into client chunks.
 */
import { createClient } from '@supabase/supabase-js'

export function createPublicBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return createClient(url, anonKey)
}
