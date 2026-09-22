/**
 * Pushes the offline queue to Supabase whenever a connection is available.
 *
 * Deliberately does not use the Background Sync API: it is unreliable on
 * iOS Safari (the platform most of these phones run), so instead this is
 * driven directly by the page — the `online` event, a polling interval, and
 * a manual "sync now" button all call the same functions here. Nothing is
 * lost by that: the queue lives in IndexedDB, so it survives a reload or the
 * tab being killed between sync attempts.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import type {
  CheckInScanPayload,
  WalkInPayload,
} from './database.types'
import {
  dismissScan,
  dismissWalkIn,
  listPendingScans,
  listPendingWalkIns,
  listRejectedScans,
  listRejectedWalkIns,
  markScanDuplicate,
  markScanSynced,
  markWalkInSynced,
  recordScanRejection,
  recordWalkInRejection,
  type QueuedScan,
  type QueuedWalkIn,
} from './offlineQueue'

const MAX_BATCH = 500

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}



export interface SyncSummary {
  scansSynced: number
  scansRejected: number
  walkInsSynced: number
  walkInsRejected: number
  /** Set when a batch could not even reach the server (offline or a network blip). */
  networkError: boolean
}

const emptySummary: SyncSummary = {
  scansSynced: 0,
  scansRejected: 0,
  walkInsSynced: 0,
  walkInsRejected: 0,
  networkError: false,
}

async function syncScanBatch(batch: QueuedScan[]): Promise<{ synced: number; rejected: number; networkError: boolean }> {
  const payload: CheckInScanPayload[] = batch.map((s) => ({
    client_scan_id: s.clientScanId,
    event_id: s.eventId,
    user_id: s.userId,
    method: s.method,
    scanned_at: s.scannedAt,
    qr_window: s.qrWindow,
    qr_sig: s.qrSig,
    category_ids: s.categoryIds,
  }))

  const { data, error } = await supabase.rpc('sync_check_ins', { p_scans: payload })
  if (error) return { synced: 0, rejected: 0, networkError: true }

  let synced = 0
  let rejected = 0
  for (const row of data ?? []) {
    if (!row.client_scan_id) continue
    if (row.result === 'created' || row.result === 'already_synced') {
      await markScanSynced(row.client_scan_id)
      synced++
    } else if (row.result === 'duplicate') {
      // Someone else already checked this member in — not a failure, just
      // no longer something this device needs to keep trying to send.
      await markScanDuplicate(row.client_scan_id)
      synced++
    } else {
      await recordScanRejection(row.client_scan_id, row.result)
      rejected++
    }
  }
  return { synced, rejected, networkError: false }
}

async function syncWalkInBatch(
  batch: QueuedWalkIn[],
): Promise<{ synced: number; rejected: number; networkError: boolean }> {
  const payload: WalkInPayload[] = batch.map((w) => ({
    id: w.id,
    event_id: w.eventId,
    full_name: w.fullName,
    email: w.email,
    phone: w.phone,
    emergency_contact_name: w.emergencyContactName,
    emergency_contact_phone: w.emergencyContactPhone,
    confirmed_adult: w.confirmedAdult,
    waiver_acknowledged: w.waiverAcknowledged,
    waiver_version: w.waiverVersion,
    recorded_at: w.recordedAt,
  }))

  const { data, error } = await supabase.rpc('sync_walk_ins', { p_walk_ins: payload })
  if (error) return { synced: 0, rejected: 0, networkError: true }

  let synced = 0
  let rejected = 0
  for (const row of data ?? []) {
    if (!row.walk_in_id) continue
    if (row.result === 'created' || row.result === 'already_synced') {
      await markWalkInSynced(row.walk_in_id)
      synced++
    } else {
      await recordWalkInRejection(row.walk_in_id, row.result)
      rejected++
    }
  }
  return { synced, rejected, networkError: false }
}

/** Pushes everything currently queued for `eventId` and reports what happened. */
export async function syncEventQueue(eventId: string): Promise<SyncSummary> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return emptySummary

  const summary: SyncSummary = { ...emptySummary }

  const pendingScans = await listPendingScans(eventId)
  for (const batch of chunk(pendingScans, MAX_BATCH)) {
    const result = await syncScanBatch(batch)
    summary.scansSynced += result.synced
    summary.scansRejected += result.rejected
    if (result.networkError) {
      summary.networkError = true
      break
    }
  }

  const pendingWalkIns = await listPendingWalkIns(eventId)
  for (const batch of chunk(pendingWalkIns, MAX_BATCH)) {
    const result = await syncWalkInBatch(batch)
    summary.walkInsSynced += result.synced
    summary.walkInsRejected += result.rejected
    if (result.networkError) {
      summary.networkError = true
      break
    }
  }

  return summary
}

const AUTO_SYNC_INTERVAL_MS = 20_000

export interface SyncQueueState {
  pendingCount: number
  rejectedScans: QueuedScan[]
  rejectedWalkIns: QueuedWalkIn[]
  syncing: boolean
  lastSyncedAt: number | null
  lastSyncFailed: boolean
  syncNow: () => Promise<void>
  dismissRejectedScan: (clientScanId: string) => Promise<void>
  dismissRejectedWalkIn: (id: string) => Promise<void>
}

/**
 * Drives sync for a single event's queue: on mount, whenever the browser
 * regains connectivity, and on a fixed interval, plus a manual trigger the
 * UI can call. All of it funnels through `syncEventQueue` above.
 */
export function useSyncQueue(eventId: string): SyncQueueState {
  const [pendingCount, setPendingCount] = useState(0)
  const [rejectedScans, setRejectedScans] = useState<QueuedScan[]>([])
  const [rejectedWalkIns, setRejectedWalkIns] = useState<QueuedWalkIn[]>([])
  const [syncing, setSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  const [lastSyncFailed, setLastSyncFailed] = useState(false)
  const syncingRef = useRef(false)

  const refreshCounts = useCallback(async () => {
    const [scans, walkIns, rejScans, rejWalkIns] = await Promise.all([
      listPendingScans(eventId),
      listPendingWalkIns(eventId),
      listRejectedScans(eventId),
      listRejectedWalkIns(eventId),
    ])
    setPendingCount(scans.length + walkIns.length)
    setRejectedScans(rejScans)
    setRejectedWalkIns(rejWalkIns)
  }, [eventId])

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return
    syncingRef.current = true
    setSyncing(true)
    try {
      const summary = await syncEventQueue(eventId)
      setLastSyncFailed(summary.networkError)
      if (!summary.networkError) setLastSyncedAt(Date.now())
      await refreshCounts()
    } finally {
      syncingRef.current = false
      setSyncing(false)
    }
  }, [eventId, refreshCounts])

  useEffect(() => {
    void refreshCounts()
  }, [refreshCounts])

  useEffect(() => {
    void syncNow()
    const onOnline = () => void syncNow()
    window.addEventListener('online', onOnline)
    const interval = window.setInterval(() => void syncNow(), AUTO_SYNC_INTERVAL_MS)
    return () => {
      window.removeEventListener('online', onOnline)
      window.clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  const dismissRejectedScan = useCallback(
    async (clientScanId: string) => {
      await dismissScan(clientScanId)
      await refreshCounts()
    },
    [refreshCounts],
  )

  const dismissRejectedWalkIn = useCallback(
    async (id: string) => {
      await dismissWalkIn(id)
      await refreshCounts()
    },
    [refreshCounts],
  )

  return {
    pendingCount,
    rejectedScans,
    rejectedWalkIns,
    syncing,
    lastSyncedAt,
    lastSyncFailed,
    syncNow,
    dismissRejectedScan,
    dismissRejectedWalkIn,
  }
}
