import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { formatDateLong, formatTimeRange, toLanguageCode } from '@/components/events/dateUtils'
import type { StaffEvent } from './useStaffEvents'

interface StaffEventCardProps {
  entry: StaffEvent
  variant: 'upcoming' | 'past'
}

function isSameCalendarDay(iso: string): boolean {
  const date = new Date(iso)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function StaffEventCard({ entry, variant }: StaffEventCardProps) {
  const { t, i18n } = useTranslation('staff')
  const lang = toLanguageCode(i18n.resolvedLanguage)
  const { event, availability } = entry

  const title = lang === 'es' ? event.title_es : event.title_en
  const isCancelled = event.status === 'cancelled'
  const isToday = isSameCalendarDay(event.starts_at)
  const showActions = variant === 'upcoming' && !isCancelled

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-card border bg-white p-5',
        isCancelled ? 'border-karma-red/30' : 'border-karma-tan-dark/25',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-xs font-bold uppercase tracking-widest text-karma-red">
          {t(`categories.${event.category}`)}
        </span>
        {isToday && !isCancelled && (
          <span className="rounded-full bg-karma-red px-2 py-0.5 text-[11px] font-semibold text-white">
            {t('home.todayBadge')}
          </span>
        )}
        {event.recurring && (
          <span className="rounded-full bg-karma-tan-light px-2 py-0.5 text-[11px] font-semibold text-karma-ink-soft">
            {t('home.recurringBadge')}
          </span>
        )}
        {isCancelled && (
          <span className="rounded-full bg-karma-red-soft px-2 py-0.5 text-[11px] font-semibold text-karma-red-dark">
            {t('home.cancelledBadge')}
          </span>
        )}
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-karma-ink">{title}</h3>
        <p className="mt-1 text-sm font-medium text-karma-ink">{formatDateLong(event.starts_at, lang)}</p>
        <p className="text-sm text-karma-ink-soft">{formatTimeRange(event.starts_at, event.ends_at, lang)}</p>
        <p className="text-sm text-karma-ink-soft">{event.venue_name}</p>
      </div>

      <p className="text-sm font-medium text-karma-ink" aria-live="polite">
        {availability
          ? t('home.counts.summary', {
              registered: availability.registered_count,
              capacity: availability.capacity,
              waitlist: availability.waitlist_count,
            })
          : t('home.counts.loading')}
        {availability && availability.waitlist_count > 0 && (
          <span className="ml-1 text-karma-red-dark">
            {t('home.counts.waitlist', { count: availability.waitlist_count })}
          </span>
        )}
      </p>

      {showActions && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            to={`/staff/events/${event.id}/scan`}
            variant="primary"
            size="lg"
            className="flex-1 justify-center"
          >
            {t('home.scanCta')}
          </ButtonLink>
          <ButtonLink
            to={`/staff/events/${event.id}/walk-in`}
            variant="secondary"
            size="lg"
            className="flex-1 justify-center"
          >
            {t('home.walkInCta')}
          </ButtonLink>
        </div>
      )}

      <ButtonLink to={`/staff/events/${event.id}/edit`} variant="ghost" size="sm" className="self-start">
        {t('home.editCta')}
      </ButtonLink>
    </div>
  )
}
