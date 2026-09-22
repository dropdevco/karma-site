import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'
import type { LeaderboardRow } from '@/lib/database.types'

interface PodiumProps {
  rows: LeaderboardRow[]
  currentUserId: string | null
}

const STEP_ORDER: Record<number, string> = {
  1: 'order-2',
  2: 'order-1',
  3: 'order-3',
}

const STEP_STYLES: Record<number, string> = {
  1: 'bg-karma-red pb-8 pt-7 sm:pb-10 sm:pt-9',
  2: 'bg-karma-tan pb-5 pt-5 sm:pb-6 sm:pt-6',
  3: 'bg-karma-tan-light pb-3 pt-4 sm:pb-4 sm:pt-5',
}

const NUMERAL_STYLES: Record<number, string> = {
  1: 'text-white/30',
  2: 'text-karma-ink/15',
  3: 'text-karma-ink/15',
}

const NAME_STYLES: Record<number, string> = {
  1: 'text-white',
  2: 'text-karma-ink',
  3: 'text-karma-ink',
}

const POINTS_STYLES: Record<number, string> = {
  1: 'text-white/85',
  2: 'text-karma-ink-soft',
  3: 'text-karma-ink-soft',
}

const YOU_BADGE_STYLES: Record<number, string> = {
  1: 'bg-white/20 text-white',
  2: 'bg-karma-red-soft text-karma-red-dark',
  3: 'bg-karma-red-soft text-karma-red-dark',
}

const PLACE_KEY: Record<number, string> = {
  1: 'podium.first',
  2: 'podium.second',
  3: 'podium.third',
}

export function Podium({ rows, currentUserId }: PodiumProps) {
  const { t } = useTranslation('leaderboard')

  if (rows.length === 0) return null

  const groups = new Map<number, LeaderboardRow[]>()
  for (const row of rows) {
    const list = groups.get(row.rank) ?? []
    list.push(row)
    groups.set(row.rank, list)
  }
  const ranks = [...groups.keys()].sort((a, b) => a - b)

  return (
    <ol
      className="flex flex-wrap items-end justify-center gap-3 sm:gap-4"
      aria-label={t('podium.ariaLabel')}
    >
      {ranks.map((rank, index) => {
        const members = groups.get(rank) ?? []
        return (
          <motion.li
            key={rank}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
            className={cn(
              'flex min-w-[6.5rem] max-w-[10rem] flex-1 flex-col items-center rounded-card px-2 text-center shadow-sm',
              STEP_ORDER[rank],
              STEP_STYLES[rank] ?? STEP_STYLES[3],
            )}
          >
            <span className="sr-only">{t(PLACE_KEY[rank] ?? PLACE_KEY[3])}</span>
            <span
              aria-hidden="true"
              className={cn(
                'font-display text-[2.75rem] font-black leading-none sm:text-[3.5rem]',
                NUMERAL_STYLES[rank] ?? NUMERAL_STYLES[3],
              )}
            >
              {rank}
            </span>
            <div className="-mt-6 flex flex-col items-center gap-1 sm:-mt-8">
              {members.map((member) => {
                const isMe = member.user_id === currentUserId
                return (
                  <div key={member.user_id} className="flex flex-col items-center">
                    <p
                      className={cn(
                        'font-display text-sm font-bold leading-tight sm:text-base',
                        NAME_STYLES[rank] ?? NAME_STYLES[3],
                      )}
                    >
                      {member.full_name}
                    </p>
                    {isMe && (
                      <span
                        className={cn(
                          'mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          YOU_BADGE_STYLES[rank] ?? YOU_BADGE_STYLES[3],
                        )}
                      >
                        {t('you')}
                      </span>
                    )}
                  </div>
                )
              })}
              <p className={cn('mt-1 text-xs font-semibold sm:text-sm', POINTS_STYLES[rank] ?? POINTS_STYLES[3])}>
                {t('pointsCount', { count: members[0]?.total_points ?? 0 })}
              </p>
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}
