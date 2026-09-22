import type { EventRosterRow } from '@/lib/database.types'

export type ScanOutcomeKind = 'accepted' | 'already' | 'stale' | 'invalid' | 'unknown'

export interface ScanOutcome {
  kind: ScanOutcomeKind
  member?: EventRosterRow
  /** Labels of any point categories applied to this check-in, e.g. "Bring clothes". */
  categoryLabels?: string[]
  at: number
}
