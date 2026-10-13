import { useCallback, useEffect, useState } from 'react'
import { supabase, isOffline } from '@/lib/supabase'
import type { StaffMemberRow } from '@/lib/database.types'

type LoadState = 'loading' | 'ready' | 'error' | 'offline'

interface UseStaffMembersResult {
  state: LoadState
  members: StaffMemberRow[]
  reload: () => void
}

export function useStaffMembers(): UseStaffMembersResult {
  const [state, setState] = useState<LoadState>('loading')
  const [members, setMembers] = useState<StaffMemberRow[]>([])
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => setReloadToken((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState('loading')
      const { data, error } = await supabase.rpc('staff_list_members')

      if (cancelled) return

      if (error) {
        setState(isOffline(error) ? 'offline' : 'error')
        return
      }

      setMembers(data ?? [])
      setState('ready')
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  return { state, members, reload }
}
