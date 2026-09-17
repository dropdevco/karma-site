import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './AuthProvider'

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** True once the member has everything registration requires. */
export function useIsReadyToRegister(): boolean {
  const { status } = useAuth()
  return Boolean(status?.profile_complete && status.is_adult && status.waiver_current)
}
