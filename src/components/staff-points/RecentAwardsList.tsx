import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

export interface RecentAward {
  id: string
  memberName: string
  points: number
  note: string
  at: number
}

interface RecentAwardsListProps {
  awards: RecentAward[]
}

export function RecentAwardsList({ awards }: RecentAwardsListProps) {
  const { t, i18n } = useTranslation('staffPoints')

  if (awards.length === 0) return null

  const timeFormatter = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="mt-8">
      <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-karma-ink-soft">
        {t('recent.heading')}
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {awards.map((award) => (
          <li
            key={award.id}
            className="flex items-start justify-between gap-3 rounded-card border border-karma-tan-dark/30 bg-white px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-display font-semibold text-karma-ink">{award.memberName}</p>
              <p className="mt-0.5 truncate text-sm text-karma-ink-soft">{award.note}</p>
              <p className="mt-0.5 text-xs text-karma-ink-soft">{timeFormatter.format(award.at)}</p>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-3 py-1 font-display text-sm font-bold',
                award.points >= 0
                  ? 'bg-karma-red text-white'
                  : 'border-2 border-karma-red bg-white text-karma-red',
              )}
            >
              {award.points >= 0 ? `+${award.points}` : award.points}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
