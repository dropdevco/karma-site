import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ButtonLink } from '@/components/ui/Button'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { cn } from '@/lib/cn'
import { toLanguageCode } from '@/components/events/dateUtils'
import { fetchUpcomingEvents, type KarmaEvent } from '@/lib/eventsApi'

function dayLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(iso))
}

function dateLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(new Date(iso))
}

export function UpcomingEvents() {
  const { t, i18n } = useTranslation('home')
  const { t: tEvents } = useTranslation('events')
  const lang = toLanguageCode(i18n.resolvedLanguage)
  const locale = lang === 'es' ? 'es-US' : 'en-US'

  const [events, setEvents] = useState<KarmaEvent[] | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    fetchUpcomingEvents(3)
      .then((data) => {
        if (cancelled) return
        setEvents(data)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Section className="border-t border-karma-tan-dark/20 bg-karma-tan-light/40 py-16 md:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <Eyebrow>{t('events.eyebrow')}</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-karma-ink sm:text-4xl">
              {t('events.heading')}
            </h2>
          </div>
          <ButtonLink to="/events" variant="ghost" className="self-start sm:self-auto">
            {t('events.cta')}
          </ButtonLink>
        </div>

        {status === 'loading' && (
          <div className="mt-10 grid gap-5 md:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'flex h-48 flex-col justify-between rounded-card border border-karma-tan-dark/30 bg-karma-cream p-6',
                  index === 0 && 'md:col-span-2',
                )}
              >
                <div className="h-4 w-24 animate-pulse rounded-full bg-karma-tan-dark/20" />
                <div className="h-6 w-1/2 animate-pulse rounded-full bg-karma-tan-dark/20" />
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <p className="mt-10 text-karma-ink-soft" role="alert">
            {tEvents('homeTeaser.error')}
          </p>
        )}

        {status === 'ready' && events && events.length === 0 && (
          <p className="mt-10 text-karma-ink-soft">{tEvents('homeTeaser.empty')}</p>
        )}

        {status === 'ready' && events && events.length > 0 && (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {events.map((event, index) => (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className={cn(
                  'flex flex-col justify-between rounded-card border border-karma-tan-dark/30 bg-karma-cream p-6',
                  index === 0 && 'md:col-span-2 md:row-span-1 md:p-8',
                )}
              >
                <div>
                  <span className="font-display text-xs font-bold uppercase tracking-[0.15em] text-karma-red">
                    {tEvents(`categories.${event.category}`)}
                  </span>
                  <h3
                    className={cn(
                      'mt-3 font-display font-bold text-karma-ink',
                      index === 0 ? 'text-2xl sm:text-3xl' : 'text-xl',
                    )}
                  >
                    {event.title[lang]}
                  </h3>
                  <p className="mt-2 text-karma-ink-soft">{event.venue.name}</p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-karma-tan-dark/30 pt-4">
                  <div>
                    <p className="font-display text-lg font-black leading-none text-karma-ink">
                      {dateLabel(event.startsAt, locale)}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-karma-ink-soft">{dayLabel(event.startsAt, locale)}</p>
                  </div>
                  <p className="rounded-full bg-karma-tan-light px-3 py-1.5 text-xs font-semibold text-karma-ink-soft">
                    {tEvents('homeTeaser.bring', { item: event.donation.itemType[lang] })}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}
