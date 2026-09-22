import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import type { DonationRow } from '@/lib/database.types'
import type { LanguageCode } from '@/i18n'
import { computeDonationTotals } from './donationTotals'
import { DonationListItem } from './DonationListItem'

export type DonationsLoadState = 'loading' | 'error' | 'ready'
export type DonationsErrorReason = 'offline' | 'unknown'

interface DonationListProps {
  eventId: string
  lang: LanguageCode
  loadState: DonationsLoadState
  errorReason: DonationsErrorReason | null
  donations: DonationRow[]
  onRetry: () => void
  onUpdated: (donation: DonationRow) => void
}

export function DonationList({
  eventId,
  lang,
  loadState,
  errorReason,
  donations,
  onRetry,
  onUpdated,
}: DonationListProps) {
  const { t } = useTranslation('staffDonations')

  if (loadState === 'loading') {
    return (
      <p className="text-karma-ink-soft" aria-busy="true">
        {t('list.loading')}
      </p>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="rounded-card border border-karma-red/30 bg-karma-red-soft/40 p-4">
        <p className="text-sm font-medium text-karma-red-dark">
          {errorReason === 'offline' ? t('list.offlineError') : t('list.loadError')}
        </p>
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          {t('list.retry')}
        </Button>
      </div>
    )
  }

  const totals = computeDonationTotals(donations)

  return (
    <div className="flex flex-col gap-6">
      {totals.length > 0 && (
        <div className="rounded-card border border-karma-tan-dark/25 bg-karma-tan-light p-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-karma-ink">
            {t('totals.title')}
          </h3>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
            {totals.map((entry) => (
              <li key={entry.unit} className="text-sm font-semibold text-karma-ink">
                {t('totals.item', { total: entry.total, unit: entry.unit })}
              </li>
            ))}
          </ul>
        </div>
      )}

      {donations.length === 0 ? (
        <p className="text-karma-ink-soft">{t('list.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {donations.map((donation) => (
            <DonationListItem
              key={donation.id}
              donation={donation}
              eventId={eventId}
              lang={lang}
              onUpdated={onUpdated}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
