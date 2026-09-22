import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'
import type { LeaderboardRow } from '@/lib/database.types'

interface RankedListProps {
  rows: LeaderboardRow[]
  currentUserId: string | null
}

export function RankedList({ rows, currentUserId }: RankedListProps) {
  const { t } = useTranslation('leaderboard')

  if (rows.length === 0) return null

  return (
    <ol className="mt-6 flex flex-col gap-2" aria-label={t('list.ariaLabel')}>
      {rows.map((row, index) => {
        const isMe = row.user_id === currentUserId
        return (
          <motion.li
            key={row.user_id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(index, 20) * 0.02 }}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-card border px-4 py-3 sm:gap-4',
              isMe ? 'border-karma-red bg-karma-red-soft' : 'border-karma-tan-dark/25 bg-white',
            )}
          >
            <span className="w-8 shrink-0 text-center font-display text-lg font-bold text-karma-ink-soft">
              {row.rank}
            </span>
            <span className="min-w-0 flex-1 truncate font-display text-base font-semibold text-karma-ink">
              {row.full_name}
            </span>
            {isMe && (
              <span className="shrink-0 rounded-full bg-karma-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {t('you')}
              </span>
            )}
            <span className="shrink-0 font-display text-sm font-bold text-karma-ink">
              {t('pointsCount', { count: row.total_points })}
            </span>
          </motion.li>
        )
      })}
    </ol>
  )
}
