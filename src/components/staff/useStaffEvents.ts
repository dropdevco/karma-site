import { useCallback, useEffect, useState } from 'react'
import { isOffline } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import type { EventAvailabilityRow, EventRow } from '@/lib/database.types'

export interface StaffEvent {
  event: EventRow
  availability: EventAvailabilityRow | null
}

type LoadState = 'loading' | 'ready' | 'error' | 'offline'

interface UseStaffEventsResult {
  state: LoadState
  upcoming: StaffEvent[]
  past: StaffEvent[]
  reload: () => void
}

export function useStaffEvents(): UseStaffEventsResult {
  const [state, setState] = useState<LoadState>('loading')
  const [upcoming, setUpcoming] = useState<StaffEvent[]>([])
  const [past, setPast] = useState<StaffEvent[]>([])
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => setReloadToken((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState('loading')
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('starts_at', { ascending: true })

      if (cancelled) return

      if (error) {
        setState(isOffline(error) ? 'offline' : 'error')
        return
      }

      const eventList = (events ?? []) as EventRow[]
      const { data: availability } = await supabase.rpc('get_event_availability', {
        p_event_ids: null,
      })

      if (cancelled) return

      const availabilityMap = new Map<string, EventAvailabilityRow>()
      for (const row of availability ?? []) {
        availabilityMap.set(row.event_id, row)
      }

      const now = Date.now()
      const nextUpcoming: StaffEvent[] = []
      const nextPast: StaffEvent[] = []

      for (const event of eventList) {
        const entry: StaffEvent = { event, availability: availabilityMap.get(event.id) ?? null }
        if (new Date(event.ends_at).getTime() >= now) {
          nextUpcoming.push(entry)
        } else {
          nextPast.push(entry)
        }
      }

      nextPast.reverse()

      setUpcoming(nextUpcoming)
      setPast(nextPast)
      setState('ready')
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  return { state, upcoming, past, reload }
}
