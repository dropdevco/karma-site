import { useTranslation } from 'react-i18next'
import type { MyPointsSummary } from '@/lib/database.types'

interface MyStandingCardProps {
  summary: MyPointsSummary
}

export function MyStandingCard({ summary }: MyStandingCardProps) {
  const { t } = useTranslation('leaderboard')

  return (
    <div
      role="status"
      className="rounded-card border border-karma-red/30 bg-karma-red-soft p-6 shadow-sm sm:p-8"
    >
      <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-karma-red">
        {t('myStanding.eyebrow')}
      </p>
      <p className="mt-2 font-display text-3xl font-extrabold text-karma-ink">
        {t('pointsCount', { count: summary.total_points })}
      </p>
      <p className="mt-1 text-sm text-karma-ink-soft">
        {summary.rank ? t('myStanding.rank', { rank: summary.rank, members: summary.member_count }) : t('myStanding.rankUnavailable')}
      </p>
      <p className="mt-3 text-sm text-karma-ink-soft">{t('myStanding.note')}</p>
    </div>
  )
}
