import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { verifyQrToken } from '@/lib/qrToken'
import type { EventRosterRow } from '@/lib/database.types'
import {
  cacheRoster,
  cacheWaiverVersion,
  enqueueScan,
  getCachedRoster,
  scannedUserIdsForEvent,
  type CachedRoster,
} from '@/lib/offlineQueue'
import { supabase } from '@/lib/supabase'
import { useSyncQueue } from '@/lib/scannerSync'
import { Container, Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { RosterPreflight } from '@/components/scanner/RosterPreflight'
import { CameraView } from '@/components/scanner/CameraView'
import { ScanResultCard } from '@/components/scanner/ScanResultCard'
import { ManualCheckInList } from '@/components/scanner/ManualCheckInList'
import { SyncStatusBar } from '@/components/scanner/SyncStatusBar'
import { playAccepted, playAlready, playRejected } from '@/components/scanner/feedback'
import type { ScanOutcome, ScanOutcomeKind } from '@/components/scanner/types'

/** How long a repeat read of the exact same code is ignored, to stop a rapid camera burst from queuing it many times. */
const REPEAT_SCAN_GUARD_MS = 4000

function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])
  return online
}

export function StaffScanner() {
  const { id: eventId } = useParams<{ id: string }>()
  const { t } = useTranslation('scanner')
  const online = useOnlineStatus()

  const [roster, setRoster] = useState<CachedRoster | null>(null)
  const [checkedInUserIds, setCheckedInUserIds] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const [cameraOn, setCameraOn] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null)
  const lastScanRef = useRef<{ raw: string; at: number } | null>(null)
  // Applies to the very next check-in only, then resets — staff taps it on
  // right as the person in front of them hands over a donation.
  const [nextIsDonation, setNextIsDonation] = useState(false)

  const sync = useSyncQueue(eventId ?? '')

  const secretsByUserId = useRef<Map<string, string>>(new Map())
  const rosterByUserId = useRef<Map<string, EventRosterRow>>(new Map())

  const applyRoster = useCallback(async (cached: CachedRoster) => {
    setRoster(cached)
    secretsByUserId.current = new Map(cached.rows.map((r) => [r.user_id, r.qr_secret]))
    rosterByUserId.current = new Map(cached.rows.map((r) => [r.user_id, r]))
    const locallyScanned = eventId ? await scannedUserIdsForEvent(eventId) : new Set<string>()
    const alreadyIn = new Set(cached.rows.filter((r) => r.checked_in).map((r) => r.user_id))
    setCheckedInUserIds(new Set([...alreadyIn, ...locallyScanned]))
  }, [eventId])

  // Load whatever is cached immediately so the page is usable the instant it opens, offline or not.
  useEffect(() => {
    if (!eventId) return
    let cancelled = false
    void getCachedRoster(eventId).then((cached) => {
      if (!cancelled && cached) void applyRoster(cached)
    })
    return () => {
      cancelled = true
    }
  }, [eventId, applyRoster])

  const downloadRoster = useCallback(async () => {
    if (!eventId) return
    setDownloading(true)
    setDownloadError(null)
    try {
      const [rosterRes, waiverRes] = await Promise.all([
        supabase.rpc('get_event_roster', { p_event_id: eventId }),
        supabase.rpc('current_waiver_version'),
      ])
      if (rosterRes.error) throw new Error(rosterRes.error.message)
      const waiverVersion = waiverRes.data ?? ''
      const cached = await cacheRoster(eventId, rosterRes.data ?? [], waiverVersion)
      if (waiverVersion) await cacheWaiverVersion(waiverVersion)
      await applyRoster(cached)
    } catch {
      setDownloadError('failed')
    } finally {
      setDownloading(false)
    }
  }, [eventId, applyRoster])

  const showOutcome = useCallback((kind: ScanOutcomeKind, member?: EventRosterRow) => {
    setOutcome({ kind, member, at: Date.now() })
    if (kind === 'accepted' || kind === 'acceptedWithDonation') playAccepted()
    else if (kind === 'already') playAlready()
    else playRejected()
  }, [])

  const acceptMember = useCallback(
    async (member: EventRosterRow, method: 'qr' | 'manual', qrWindow?: number, qrSig?: string) => {
      if (!eventId) return
      const broughtDonation = nextIsDonation
      await enqueueScan({
        clientScanId: crypto.randomUUID(),
        eventId,
        userId: member.user_id,
        memberName: member.full_name,
        method,
        scannedAt: new Date().toISOString(),
        qrWindow,
        qrSig,
        broughtDonation,
      })
      setCheckedInUserIds((prev) => new Set(prev).add(member.user_id))
      setNextIsDonation(false)
      showOutcome(broughtDonation ? 'acceptedWithDonation' : 'accepted', member)
      void sync.syncNow()
    },
    [eventId, nextIsDonation, showOutcome, sync],
  )

  const handleDecode = useCallback(
    (raw: string) => {
      const now = Date.now()
      const last = lastScanRef.current
      if (last && last.raw === raw && now - last.at < REPEAT_SCAN_GUARD_MS) return
      lastScanRef.current = { raw, at: now }

      void (async () => {
        const result = await verifyQrToken(raw, (userId) => secretsByUserId.current.get(userId), now)
        if (!result.ok) {
          if (result.reason === 'stale_code') {
            showOutcome('stale')
          } else if (result.reason === 'unknown_member') {
            showOutcome('unknown')
          } else {
            showOutcome('invalid')
          }
          return
        }

        const member = rosterByUserId.current.get(result.token.userId)
        if (!member) {
          showOutcome('unknown')
          return
        }
        if (checkedInUserIds.has(member.user_id)) {
          showOutcome('already', member)
          return
        }
        await acceptMember(member, 'qr', result.token.window, result.token.sig)
      })()
    },
    [checkedInUserIds, acceptMember, showOutcome],
  )

  const handleManualCheckIn = useCallback(
    (member: EventRosterRow) => {
      void acceptMember(member, 'manual')
    },
    [acceptMember],
  )

  if (!eventId) return null

  const hasRoster = roster !== null

  return (
    <Section className="py-8 sm:py-10">
      <Container className="max-w-xl">
        <h1 className="font-display text-2xl font-extrabold text-karma-ink">{t('title')}</h1>
        <p className="mt-1 text-karma-ink-soft">{t('subtitle')}</p>

        <div className="mt-5">
          <RosterPreflight
            memberCount={roster?.rows.length ?? null}
            cachedAt={roster?.cachedAt ?? null}
            online={online}
            downloading={downloading}
            downloadError={downloadError}
            onDownload={() => void downloadRoster()}
          />
        </div>

        {hasRoster && (
          <>
            <div className="mt-5">
              <SyncStatusBar
                online={online}
                pendingCount={sync.pendingCount}
                syncing={sync.syncing}
                lastSyncFailed={sync.lastSyncFailed}
                rejectedScans={sync.rejectedScans}
                rejectedWalkIns={sync.rejectedWalkIns}
                onSyncNow={() => void sync.syncNow()}
                onDismissScan={(id) => void sync.dismissRejectedScan(id)}
                onDismissWalkIn={(id) => void sync.dismissRejectedWalkIn(id)}
              />
            </div>

            <button
              type="button"
              onClick={() => setNextIsDonation((v) => !v)}
              aria-pressed={nextIsDonation}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-card border-2 py-3 font-display text-base font-bold transition-colors ${
                nextIsDonation
                  ? 'border-karma-red bg-karma-red text-white'
                  : 'border-karma-tan-dark/40 bg-karma-tan-light text-karma-ink'
              }`}
            >
              {nextIsDonation ? t('donationToggle.on') : t('donationToggle.off')}
            </button>

            <div className="mt-3 flex gap-2">
              <Button
                className="flex-1"
                variant={manualMode ? 'secondary' : 'primary'}
                onClick={() => setManualMode(false)}
              >
                {t('mode.scan')}
              </Button>
              <Button
                className="flex-1"
                variant={manualMode ? 'primary' : 'secondary'}
                onClick={() => {
                  setManualMode(true)
                  setCameraOn(false)
                }}
              >
                {t('mode.manual')}
              </Button>
            </div>

            <div className="mt-5">
              {manualMode ? (
                <ManualCheckInList
                  roster={roster.rows}
                  checkedInUserIds={checkedInUserIds}
                  onCheckIn={handleManualCheckIn}
                />
              ) : cameraOn ? (
                <CameraView active={cameraOn} onDecode={handleDecode} />
              ) : (
                <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-4 rounded-card border-2 border-dashed border-karma-tan-dark/40 bg-karma-tan-light px-6 text-center">
                  <p className="font-display text-lg font-semibold text-karma-ink">{t('camera.notStarted')}</p>
                  {/* getUserMedia needs an explicit tap on iOS Safari, so the camera never opens on its own. */}
                  <Button size="lg" onClick={() => setCameraOn(true)}>
                    {t('camera.startCta')}
                  </Button>
                </div>
              )}
            </div>

            {outcome && (
              <div className="mt-5">
                <ScanResultCard outcome={outcome} />
              </div>
            )}
          </>
        )}
      </Container>
    </Section>
  )
}
