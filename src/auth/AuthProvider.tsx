import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { AccountStatus, ProfileRow } from '@/lib/database.types'

export interface AuthContextValue {
  /** True until the stored session has been read. Routes should wait on this. */
  loading: boolean
  session: Session | null
  user: User | null
  profile: ProfileRow | null
  status: AccountStatus | null
  /** Profile and status came from cache because the network was unavailable. */
  stale: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const cacheKey = (userId: string) => `karma-account:${userId}`

type CachedAccount = { profile: ProfileRow; status: AccountStatus }

// The member QR page and the staff scanner both have to work at a venue with no
// signal, so the last known profile and role are cached alongside the session.
function readCache(userId: string): CachedAccount | null {
  try {
    const raw = localStorage.getItem(cacheKey(userId))
    return raw ? (JSON.parse(raw) as CachedAccount) : null
  } catch {
    return null
  }
}

function writeCache(userId: string, value: CachedAccount) {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(value))
  } catch {
    /* private mode or full quota: cache is best effort */
  }
}

function clearCache(userId: string) {
  try {
    localStorage.removeItem(cacheKey(userId))
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [status, setStatus] = useState<AccountStatus | null>(null)
  const [stale, setStale] = useState(false)
  const activeUserId = useRef<string | null>(null)

  const loadAccount = useCallback(async (userId: string) => {
    const cached = readCache(userId)
    if (cached) {
      setProfile(cached.profile)
      setStatus(cached.status)
      setStale(true)
    }

    const [profileRes, statusRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.rpc('get_my_account_status'),
    ])

    if (activeUserId.current !== userId) return

    const nextProfile: ProfileRow | null = profileRes.data
    const nextStatus: AccountStatus | null = statusRes.data

    // Offline or transient: keep whatever the cache gave us.
    if (!nextProfile || !nextStatus) return

    setProfile(nextProfile)
    setStatus(nextStatus)
    setStale(false)
    writeCache(userId, { profile: nextProfile, status: nextStatus })
  }, [])

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      const next = data.session ?? null
      setSession(next)
      activeUserId.current = next?.user.id ?? null
      if (next?.user) {
        void loadAccount(next.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      const userId = next?.user.id ?? null
      activeUserId.current = userId

      if (!userId) {
        setProfile(null)
        setStatus(null)
        setStale(false)
        return
      }
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        void loadAccount(userId)
      }
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [loadAccount])

  const refresh = useCallback(async () => {
    const userId = activeUserId.current
    if (userId) await loadAccount(userId)
  }, [loadAccount])

  const signOut = useCallback(async () => {
    const userId = activeUserId.current
    if (userId) clearCache(userId)
    await supabase.auth.signOut()
    setProfile(null)
    setStatus(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      status,
      stale,
      refresh,
      signOut,
    }),
    [loading, session, profile, status, stale, refresh, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
