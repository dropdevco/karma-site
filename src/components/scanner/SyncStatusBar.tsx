import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { QueuedScan, QueuedWalkIn } from '@/lib/offlineQueue'

interface SyncStatusBarProps {
  online: boolean
  pendingCount: number
  syncing: boolean
  lastSyncFailed: boolean
  rejectedScans: QueuedScan[]
  rejectedWalkIns: QueuedWalkIn[]
  onSyncNow: () => void
  onDismissScan: (clientScanId: string) => void
  onDismissWalkIn: (id: string) => void
}

/**
 * Rejections (server said no, e.g. a stale/tampered signature that slipped
 * past on-device checks) stay visible until a staff member dismisses them
 * rather than being silently dropped from the queue.
 */
export function SyncStatusBar({
  online,
  pendingCount,
  syncing,
  lastSyncFailed,
  rejectedScans,
  rejectedWalkIns,
  onSyncNow,
  onDismissScan,
  onDismissWalkIn,
}: SyncStatusBarProps) {
  const { t } = useTranslation('scanner')
  const hasRejections = rejectedScans.length > 0 || rejectedWalkIns.length > 0

  return (
    <div className="rounded-card border-2 border-karma-tan-dark/30 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn('h-3 w-3 rounded-full', online ? 'bg-green-600' : 'bg-karma-red')}
            aria-hidden="true"
          />
          <p className="font-display text-base font-bold text-karma-ink">
            {online ? t('sync.online') : t('sync.offline')}
          </p>
        </div>
        <p className="font-display text-base font-semibold text-karma-ink">
          {t('sync.pending', { count: pendingCount })}
        </p>
        <Button size="sm" variant="secondary" onClick={onSyncNow} disabled={syncing || !online}>
          {syncing ? t('sync.syncing') : t('sync.syncNow')}
        </Button>
      </div>

      {lastSyncFailed && <p className="mt-2 text-sm font-semibold text-karma-red">{t('sync.lastAttemptFailed')}</p>}

      {hasRejections && (
        <div className="mt-4 flex flex-col gap-2 border-t border-karma-tan-dark/30 pt-3">
          <p className="text-sm font-bold uppercase tracking-wide text-karma-red">{t('sync.rejectedHeading')}</p>
          {rejectedScans.map((scan) => (
            <div
              key={scan.clientScanId}
              className="flex items-center justify-between gap-3 rounded-xl bg-karma-red-soft px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-karma-ink">{scan.memberName}</p>
                <p className="truncate text-sm text-karma-ink-soft">{scan.rejectReason}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onDismissScan(scan.clientScanId)}>
                {t('sync.dismiss')}
              </Button>
            </div>
          ))}
          {rejectedWalkIns.map((walkIn) => (
            <div
              key={walkIn.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-karma-red-soft px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-karma-ink">{walkIn.fullName}</p>
                <p className="truncate text-sm text-karma-ink-soft">{walkIn.rejectReason}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onDismissWalkIn(walkIn.id)}>
                {t('sync.dismiss')}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
