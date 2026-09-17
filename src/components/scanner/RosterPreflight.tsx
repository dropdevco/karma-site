import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { formatRelativeTime } from './relativeTime'

interface RosterPreflightProps {
  memberCount: number | null
  cachedAt: string | null
  online: boolean
  downloading: boolean
  downloadError: string | null
  onDownload: () => void
}

/**
 * The one screen that has to be unambiguous: whether this phone is actually
 * ready to check people in with no signal. A stale-but-present roster is
 * fine (best available data); no roster at all with no connection is the
 * single unrecoverable situation, so that state is called out bluntly
 * rather than folded into a generic error banner.
 */
export function RosterPreflight({
  memberCount,
  cachedAt,
  online,
  downloading,
  downloadError,
  onDownload,
}: RosterPreflightProps) {
  const { t, i18n } = useTranslation('scanner')

  if (memberCount === null) {
    const blocked = !online
    return (
      <div
        className={cn(
          'rounded-card border-2 p-5',
          blocked ? 'border-karma-red bg-karma-red-soft' : 'border-karma-tan-dark/40 bg-karma-tan-light',
        )}
      >
        <p className="font-display text-xl font-bold text-karma-ink">
          {blocked ? t('preflight.blockedTitle') : t('preflight.needsDownloadTitle')}
        </p>
        <p className="mt-2 text-base text-karma-ink-soft">
          {blocked ? t('preflight.blockedBody') : t('preflight.needsDownloadBody')}
        </p>
        {downloadError && (
          <p className="mt-2 text-sm font-semibold text-karma-red">{t('preflight.downloadError')}</p>
        )}
        <Button
          size="lg"
          className="mt-4 w-full"
          onClick={onDownload}
          disabled={downloading || (!online && blocked)}
        >
          {downloading ? t('preflight.downloading') : t('preflight.downloadCta')}
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-card border-2 border-karma-tan-dark/30 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xl font-bold text-karma-ink">
            {t('preflight.readyTitle', { count: memberCount })}
          </p>
          {cachedAt && (
            <p className="mt-1 text-sm text-karma-ink-soft">
              {t('preflight.updated', { time: formatRelativeTime(cachedAt, i18n.language) })}
            </p>
          )}
        </div>
        <span className="mt-1 inline-flex shrink-0 items-center rounded-full bg-karma-red-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-karma-red">
          {t('preflight.readyBadge')}
        </span>
      </div>
      {downloadError && (
        <p className="mt-3 text-sm font-semibold text-karma-red">{t('preflight.downloadError')}</p>
      )}
      <Button
        variant="secondary"
        size="sm"
        className="mt-4"
        onClick={onDownload}
        disabled={downloading || !online}
      >
        {downloading ? t('preflight.downloading') : t('preflight.redownloadCta')}
      </Button>
      {!online && <p className="mt-2 text-xs text-karma-ink-soft">{t('preflight.redownloadNeedsSignal')}</p>}
    </div>
  )
}
