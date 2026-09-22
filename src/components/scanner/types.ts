import type { EventRosterRow } from '@/lib/database.types'

export type ScanOutcomeKind = 'accepted' | 'acceptedWithDonation' | 'already' | 'stale' | 'invalid' | 'unknown'

export interface ScanOutcome {
  kind: ScanOutcomeKind
  member?: EventRosterRow
  at: number
}
