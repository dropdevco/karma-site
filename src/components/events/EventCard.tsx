import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'
import type { KarmaEvent } from '@/lib/eventsApi'
import { CategoryVisual } from './CategoryVisual'
import { CapacityBadge } from './CapacityBadge'
import { formatDateShort, formatTimeRange, toLanguageCode } from './dateUtils'

interface EventCardProps {
  event: KarmaEvent
}

export function EventCard({ event }: EventCardProps) {
  const { t, i18n } = useTranslation('events')
  const lang = toLanguageCode(i18n.resolvedLanguage)
  const cancelled = event.status === 'cancelled'

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="list-none"
    >
      <Link
        to={`/events/${event.slug}`}
        className={cn(
          'group grid grid-cols-[6rem_1fr] overflow-hidden rounded-card border bg-white transition-shadow hover:shadow-lg sm:grid-cols-[7rem_1fr]',
          cancelled ? 'border-karma-ink/30' : 'border-karma-tan-dark/25',
        )}
      >
        <div className={cn('relative flex flex-col', cancelled && 'opacity-60')}>
          <CategoryVisual category={event.category} className="h-full min-h-32" />
          <div className="absolute inset-x-0 bottom-0 bg-karma-ink/80 px-2 py-1 text-center">
            <time dateTime={event.startsAt} className="block font-display text-xs font-bold uppercase tracking-wide text-white">
              {formatDateShort(event.startsAt, lang)}
            </time>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 p-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-karma-red">
                {t(`categories.${event.category}`)}
              </span>
              {event.recurring && (
                <span className="rounded-full bg-karma-tan-light px-2 py-0.5 text-[11px] font-semibold text-karma-ink-soft">
                  {t('recurringBadge')}
                </span>
              )}
              {cancelled && (
                <span className="rounded-full bg-karma-ink px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  {t('status.cancelled')}
                </span>
              )}
            </div>
            <h3
              className={cn(
                'mt-1 font-display text-lg font-bold text-karma-ink group-hover:text-karma-red-dark',
                cancelled && 'line-through decoration-2',
              )}
            >
              {event.title[lang]}
            </h3>
            <p className="mt-1 text-sm text-karma-ink-soft">
              {formatTimeRange(event.startsAt, event.endsAt, lang)} &middot; {event.venue.name}
            </p>
            <p className="mt-2 text-sm text-karma-ink-soft">
              <span className="font-semibold text-karma-ink">{t('card.collecting')}:</span>{' '}
              {event.donation.itemType[lang]}
            </p>
          </div>
          {!cancelled && <CapacityBadge spotsTaken={event.spotsTaken} capacity={event.capacity} />}
        </div>
      </Link>
    </motion.li>
  )
}
