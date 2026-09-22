import { supabase, rpcErrorCode, isOffline } from '@/lib/supabase'
import type { LeaderboardRow, MyPointsSummary } from '@/lib/database.types'

export interface LeaderboardData {
  rows: LeaderboardRow[]
  mySummary: MyPointsSummary | null
}

export type LeaderboardErrorCode = 'not_authenticated' | 'offline' | 'unknown'

export type LeaderboardResult =
  | { ok: true; data: LeaderboardData }
  | { ok: false; code: LeaderboardErrorCode }

export async function fetchLeaderboardData(): Promise<LeaderboardResult> {
  try {
    const [leaderboardRes, summaryRes] = await Promise.all([
      supabase.rpc('get_leaderboard', { p_limit: 100 }),
      supabase.rpc('get_my_points_summary'),
    ])

    if (leaderboardRes.error) throw leaderboardRes.error
    if (summaryRes.error) throw summaryRes.error

    return {
      ok: true,
      data: {
        rows: leaderboardRes.data ?? [],
        mySummary: summaryRes.data ?? null,
      },
    }
  } catch (error) {
    if (isOffline(error)) return { ok: false, code: 'offline' }
    const code = rpcErrorCode(error)
    if (code === 'not_authenticated') return { ok: false, code: 'not_authenticated' }
    return { ok: false, code: 'unknown' }
  }
}
