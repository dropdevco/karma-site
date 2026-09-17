import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.SUPABASE_URL
const anonKey = import.meta.env.SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_ANON_KEY. Copy .env.example to .env.local.',
  )
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'karma-auth',
  },
})

/**
 * Postgres raises our domain failures as bare messages ('waiver_required',
 * 'under_18', …). Everything else is unexpected and should surface as a
 * generic failure rather than leaking database text to a member.
 */
const KNOWN_ERRORS = new Set([
  'not_authenticated',
  'forbidden',
  'event_not_found',
  'event_cancelled',
  'event_ended',
  'event_started',
  'profile_incomplete',
  'under_18',
  'waiver_required',
  'invalid_payload',
  'batch_too_large',
])

export function rpcErrorCode(error: unknown): string {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : ''
  for (const code of KNOWN_ERRORS) {
    if (message.includes(code)) return code
  }
  return 'unknown'
}

export function isOffline(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message).toLowerCase()
      : ''
  return message.includes('failed to fetch') || message.includes('networkerror')
}
