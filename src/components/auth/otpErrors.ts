import type { AuthError } from '@supabase/supabase-js'
import { isOffline } from '@/lib/supabase'

export type AuthErrorCode =
  | 'offline'
  | 'rateLimited'
  | 'codeInvalid'
  | 'codeFormat'
  | 'emailInvalid'
  | 'generic'

export function classifyAuthError(error: AuthError, context: 'send' | 'verify'): AuthErrorCode {
  if (isOffline(error)) return 'offline'

  const message = error.message.toLowerCase()
  const status = error.status

  if (status === 429 || message.includes('rate limit') || message.includes('security purposes')) {
    return 'rateLimited'
  }

  if (
    context === 'verify' &&
    (message.includes('expired') || message.includes('invalid') || message.includes('token'))
  ) {
    return 'codeInvalid'
  }

  if (context === 'send' && (message.includes('invalid') || message.includes('unable to validate'))) {
    return 'emailInvalid'
  }

  return 'generic'
}

export function classifyThrown(error: unknown): AuthErrorCode {
  return isOffline(error) ? 'offline' : 'generic'
}
