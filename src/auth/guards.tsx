import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

function Waiting() {
  return <div className="min-h-[60vh]" aria-busy="true" />
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, session } = useAuth()
  const location = useLocation()

  if (loading) return <Waiting />
  if (!session) {
    return <Navigate to="/signin" replace state={{ returnTo: location.pathname + location.search }} />
  }
  return <>{children}</>
}

/**
 * Role comes from the cached account status so the scanner still opens at a
 * venue with no signal. The database re-checks staff on every call that
 * matters, so a stale cache cannot grant real access.
 */
export function RequireStaff({ children }: { children: ReactNode }) {
  const { loading, session, status } = useAuth()
  const location = useLocation()

  if (loading) return <Waiting />
  if (!session) {
    return <Navigate to="/signin" replace state={{ returnTo: location.pathname + location.search }} />
  }
  if (!status) return <Waiting />
  if (status.role !== 'staff' && status.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
