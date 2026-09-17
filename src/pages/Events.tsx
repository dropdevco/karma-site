import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { EventFilters, type WhenFilter } from '@/components/events/EventFilters'
import { MonthGroup } from '@/components/events/MonthGroup'
import { EmptyState } from '@/components/events/EmptyState'
import { EventsSkeleton } from '@/components/events/EventsSkeleton'
import { ErrorState } from '@/components/events/ErrorState'
import { isEventCategory } from '@/components/events/categoryMeta'
import { formatMonthYear, monthKey, toLanguageCode } from '@/components/events/dateUtils'
import { fetchAllEvents, type KarmaEvent, type EventCategory } from '@/lib/eventsApi'

export function Events() {
  const { t, i18n } = useTranslation('events')
  const lang = toLanguageCode(i18n.resolvedLanguage)
  const [searchParams, setSearchParams] = useSearchParams()

  const [events, setEvents] = useState<KarmaEvent[] | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(() => {
    setStatus('loading')
    fetchAllEvents()
      .then((data) => {
        setEvents(data)
        setStatus('ready')
      })
      .catch(() => {
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const when: WhenFilter = searchParams.get('when') === 'past' ? 'past' : 'upcoming'
  const categoryParam = searchParams.get('category')
  const category: EventCategory | 'all' = categoryParam && isEventCategory(categoryParam) ? categoryParam : 'all'

  const baseEvents = useMemo(() => {
    if (!events) return []
    const now = new Date()
    const filtered = events.filter((event) => (when === 'past' ? new Date(event.endsAt) < now : new Date(event.endsAt) >= now))
    return filtered.sort((a, b) =>
      when === 'past'
        ? new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
        : new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
  }, [events, when])

  const filteredEvents = useMemo(
    () => (category === 'all' ? baseEvents : baseEvents.filter((event) => event.category === category)),
    [baseEvents, category],
  )

  const groups = useMemo(() => {
    const map = new Map<string, KarmaEvent[]>()
    for (const event of filteredEvents) {
      const key = monthKey(event.startsAt)
      const list = map.get(key)
      if (list) list.push(event)
      else map.set(key, [event])
    }
    return Array.from(map.entries())
  }, [filteredEvents])

  function handleCategoryChange(next: EventCategory | 'all') {
    const params = new URLSearchParams(searchParams)
    if (next === 'all') params.delete('category')
    else params.set('category', next)
    setSearchParams(params, { replace: true })
  }

  function handleWhenChange(next: WhenFilter) {
    const params = new URLSearchParams(searchParams)
    if (next === 'upcoming') params.delete('when')
    else params.set('when', next)
    setSearchParams(params, { replace: true })
  }

  function handleReset() {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  return (
    <>
      <Section className="pb-8 pt-12 sm:pt-16">
        <Container>
          <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold text-karma-ink sm:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-karma-ink-soft">{t('hero.description')}</p>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <EventFilters
            category={category}
            when={when}
            onCategoryChange={handleCategoryChange}
            onWhenChange={handleWhenChange}
          />

          <p className="mt-6 text-sm font-medium text-karma-ink-soft" aria-live="polite">
            {status === 'loading'
              ? t('loading.events')
              : status === 'ready'
                ? t('filters.resultsCount', { count: filteredEvents.length })
                : ''}
          </p>

          {status === 'loading' && <EventsSkeleton />}

          {status === 'error' && (
            <div className="mt-6">
              <ErrorState
                title={t('error.title')}
                body={t('error.body')}
                retryLabel={t('error.retry')}
                onRetry={load}
              />
            </div>
          )}

          {status === 'ready' &&
            (groups.length === 0 ? (
              <div className="mt-6">
                <EmptyState onReset={handleReset} />
              </div>
            ) : (
              <div className="mt-2">
                {groups.map(([key, groupEvents]) => (
                  <MonthGroup key={key} label={formatMonthYear(groupEvents[0].startsAt, lang)} events={groupEvents} />
                ))}
              </div>
            ))}
        </Container>
      </Section>
    </>
  )
}
