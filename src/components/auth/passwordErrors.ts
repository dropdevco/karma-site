import type { AuthError } from '@supabase/supabase-js'
import { isOffline } from '@/lib/supabase'

export type SignInErrorCode = 'offline' | 'rateLimited' | 'invalidCredentials' | 'generic'
export type ResetRequestErrorCode = 'offline' | 'rateLimited' | 'generic'
export type PasswordUpdateErrorCode = 'offline' | 'rateLimited' | 'weakPassword' | 'generic'

function isRateLimited(error: AuthError): boolean {
  const message = error.message.toLowerCase()
  return error.status === 429 || message.includes('rate limit') || message.includes('security purposes')
}

export function classifySignInError(error: AuthError): SignInErrorCode {
  if (isOffline(error)) return 'offline'
  if (isRateLimited(error)) return 'rateLimited'

  const message = error.message.toLowerCase()
  if (message.includes('invalid') || message.includes('credentials')) {
    return 'invalidCredentials'
  }

  return 'generic'
}

export function classifyResetRequestError(error: AuthError): ResetRequestErrorCode {
  if (isOffline(error)) return 'offline'
  if (isRateLimited(error)) return 'rateLimited'
  return 'generic'
}

export function classifyPasswordUpdateError(error: AuthError): PasswordUpdateErrorCode {
  if (isOffline(error)) return 'offline'
  if (isRateLimited(error)) return 'rateLimited'

  const message = error.message.toLowerCase()
  if (message.includes('password') || message.includes('weak') || message.includes('short') || message.includes('characters')) {
    return 'weakPassword'
  }

  return 'generic'
}

/** Covers thrown (non-AuthError) failures, e.g. a network exception. */
export function classifyThrownPasswordError(error: unknown): 'offline' | 'generic' {
  return isOffline(error) ? 'offline' : 'generic'
}
