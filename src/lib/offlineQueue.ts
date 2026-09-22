/**
 * The offline queue this scanner runs on.
 *
 * Everything here has to survive the network vanishing the moment doors
 * open: the roster is downloaded once (or re-downloaded manually) and read
 * from IndexedDB for the rest of the event, and every check-in or walk-in a
 * staff member records is written locally first and synced opportunistically.
 *
 * The idempotency key for a scan is `clientScanId`, generated on-device at
 * scan time (see StaffScanner). It is the Dexie primary key, so re-enqueuing
 * the same scan is a no-op, and the server's `sync_check_ins` also keys off
 * it, so a scan that syncs twice (e.g. a sync that succeeded but whose
 * response never reached the device) can never double-count a check-in.
 */
import Dexie, { type Table } from 'dexie'
import type { CheckInMethod, EventRosterRow, EventRow } from './database.types'

export type QueueStatus = 'pending' | 'synced' | 'duplicate' | 'rejected'

export interface CachedRoster {
  eventId: string
  rows: EventRosterRow[]
  waiverVersion: string
  cachedAt: string
}

export interface CachedEvent {
  eventId: string
  event: EventRow
  cachedAt: string
}

/** current_waiver_version() is global, not per-event, so it gets its own single-row cache. */
export interface CachedWaiverVersion {
  key: 'current'
  version: string
  cachedAt: string
}

export interface QueuedScan {
  clientScanId: string
  eventId: string
  userId: string
  memberName: string
  method: CheckInMethod
  scannedAt: string
  qrWindow?: number
  qrSig?: string
  broughtDonation?: boolean
  status: QueueStatus
  rejectReason?: string
  queuedAt: string
  syncedAt?: string
}

export interface QueuedWalkIn {
  id: string
  eventId: string
  fullName: string
  email?: string
  phone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  confirmedAdult: boolean
  waiverAcknowledged: boolean
  waiverVersion: string
  recordedAt: string
  status: QueueStatus
  rejectReason?: string
  queuedAt: string
  syncedAt?: string
}

class OfflineQueueDb extends Dexie {
  rosters!: Table<CachedRoster, string>
  events!: Table<CachedEvent, string>
  waiverVersions!: Table<CachedWaiverVersion, string>
  scans!: Table<QueuedScan, string>
  walkIns!: Table<QueuedWalkIn, string>

  constructor() {
    super('karma-offline-queue')
    this.version(1).stores({
      rosters: 'eventId',
      events: 'eventId',
      waiverVersions: 'key',
      scans: 'clientScanId, eventId, status',
      walkIns: 'id, eventId, status',
    })
  }
}

export const offlineDb = new OfflineQueueDb()

// ---- Roster + event cache -------------------------------------------------

export async function cacheRoster(
  eventId: string,
  rows: EventRosterRow[],
  waiverVersion: string,
): Promise<CachedRoster> {
  const record: CachedRoster = { eventId, rows, waiverVersion, cachedAt: new Date().toISOString() }
  await offlineDb.rosters.put(record)
  return record
}

export function getCachedRoster(eventId: string): Promise<CachedRoster | undefined> {
  return offlineDb.rosters.get(eventId)
}

export async function cacheEvent(event: EventRow): Promise<void> {
  await offlineDb.events.put({ eventId: event.id, event, cachedAt: new Date().toISOString() })
}

export function getCachedEvent(eventId: string): Promise<CachedEvent | undefined> {
  return offlineDb.events.get(eventId)
}

export async function cacheWaiverVersion(version: string): Promise<void> {
  await offlineDb.waiverVersions.put({ key: 'current', version, cachedAt: new Date().toISOString() })
}

export async function getCachedWaiverVersion(): Promise<string | undefined> {
  const row = await offlineDb.waiverVersions.get('current')
  return row?.version
}

// ---- Check-in scan queue ----------------------------------------------------

export type NewScan = Omit<QueuedScan, 'status' | 'queuedAt' | 'syncedAt' | 'rejectReason'>

/**
 * Idempotent by `clientScanId`: if the same scan id is enqueued twice (e.g. a
 * duplicate event fired by the camera loop) this simply returns the existing
 * record rather than creating a second one.
 */
export async function enqueueScan(scan: NewScan): Promise<QueuedScan> {
  const existing = await offlineDb.scans.get(scan.clientScanId)
  if (existing) return existing
  const record: QueuedScan = { ...scan, status: 'pending', queuedAt: new Date().toISOString() }
  await offlineDb.scans.put(record)
  return record
}

export function listPendingScans(eventId?: string): Promise<QueuedScan[]> {
  const query = offlineDb.scans.where('status').equals('pending')
  return eventId ? query.and((s) => s.eventId === eventId).toArray() : query.toArray()
}

export function listRejectedScans(eventId?: string): Promise<QueuedScan[]> {
  const query = offlineDb.scans.where('status').equals('rejected')
  return eventId ? query.and((s) => s.eventId === eventId).toArray() : query.toArray()
}

export function countPendingScans(eventId: string): Promise<number> {
  return offlineDb.scans.where('status').equals('pending').and((s) => s.eventId === eventId).count()
}

export async function markScanSynced(clientScanId: string): Promise<void> {
  await offlineDb.scans.update(clientScanId, { status: 'synced', syncedAt: new Date().toISOString() })
}

export async function markScanDuplicate(clientScanId: string): Promise<void> {
  await offlineDb.scans.update(clientScanId, { status: 'duplicate', syncedAt: new Date().toISOString() })
}

export async function recordScanRejection(clientScanId: string, reason: string): Promise<void> {
  await offlineDb.scans.update(clientScanId, { status: 'rejected', rejectReason: reason })
}

export async function dismissScan(clientScanId: string): Promise<void> {
  await offlineDb.scans.delete(clientScanId)
}

/** All check-ins already recorded on this device for the event, regardless of sync state. */
export async function scannedUserIdsForEvent(eventId: string): Promise<Set<string>> {
  const rows = await offlineDb.scans.where('eventId').equals(eventId).toArray()
  return new Set(rows.filter((r) => r.status !== 'rejected').map((r) => r.userId))
}

// ---- Walk-in queue ----------------------------------------------------------

export type NewWalkIn = Omit<QueuedWalkIn, 'status' | 'queuedAt' | 'syncedAt' | 'rejectReason'>

export async function enqueueWalkIn(walkIn: NewWalkIn): Promise<QueuedWalkIn> {
  const existing = await offlineDb.walkIns.get(walkIn.id)
  if (existing) return existing
  const record: QueuedWalkIn = { ...walkIn, status: 'pending', queuedAt: new Date().toISOString() }
  await offlineDb.walkIns.put(record)
  return record
}

export function listPendingWalkIns(eventId?: string): Promise<QueuedWalkIn[]> {
  const query = offlineDb.walkIns.where('status').equals('pending')
  return eventId ? query.and((w) => w.eventId === eventId).toArray() : query.toArray()
}

export function listRejectedWalkIns(eventId?: string): Promise<QueuedWalkIn[]> {
  const query = offlineDb.walkIns.where('status').equals('rejected')
  return eventId ? query.and((w) => w.eventId === eventId).toArray() : query.toArray()
}

export function countPendingWalkIns(eventId: string): Promise<number> {
  return offlineDb.walkIns.where('status').equals('pending').and((w) => w.eventId === eventId).count()
}

export async function markWalkInSynced(id: string): Promise<void> {
  await offlineDb.walkIns.update(id, { status: 'synced', syncedAt: new Date().toISOString() })
}

export async function recordWalkInRejection(id: string, reason: string): Promise<void> {
  await offlineDb.walkIns.update(id, { status: 'rejected', rejectReason: reason })
}

export async function dismissWalkIn(id: string): Promise<void> {
  await offlineDb.walkIns.delete(id)
}
