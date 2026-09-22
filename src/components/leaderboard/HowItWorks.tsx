import { useTranslation } from 'react-i18next'

export function HowItWorks() {
  const { t } = useTranslation('leaderboard')

  return (
    <div className="rounded-card border border-karma-tan-dark/25 bg-white p-6 sm:p-8">
      <h2 className="font-display text-lg font-bold text-karma-ink">{t('howItWorks.heading')}</h2>
      <ul className="mt-4 flex flex-col gap-3 text-sm text-karma-ink-soft">
        <li className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-karma-red-soft font-display text-xs font-bold text-karma-red-dark"
          >
            1
          </span>
          <span>{t('howItWorks.checkIn')}</span>
        </li>
        <li className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-karma-red-soft font-display text-xs font-bold text-karma-red-dark"
          >
            2
          </span>
          <span>{t('howItWorks.donationBonus')}</span>
        </li>
      </ul>
    </div>
  )
}
