import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { EventFilters, type WhenFilter } from '@/components/events/EventFilters'
import { MonthGroup } from '@/components/events/MonthGroup'
import { EmptyState } from '@/components/events/EmptyState'
import { isEventCategory } from '@/components/events/categoryMeta'
import { formatMonthYear, monthKey, toLanguageCode } from '@/components/events/dateUtils'
import { getPastEvents, getUpcomingEvents } from '@/data/events'
import type { KarmaEvent, EventCategory } from '@/data/events'

export function Events() {
  const { t, i18n } = useTranslation('events')
  const lang = toLanguageCode(i18n.resolvedLanguage)
  const [searchParams, setSearchParams] = useSearchParams()

  const when: WhenFilter = searchParams.get('when') === 'past' ? 'past' : 'upcoming'
  const categoryParam = searchParams.get('category')
  const category: EventCategory | 'all' = categoryParam && isEventCategory(categoryParam) ? categoryParam : 'all'

  const baseEvents = useMemo(() => (when === 'past' ? getPastEvents() : getUpcomingEvents()), [when])

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
            {t('filters.resultsCount', { count: filteredEvents.length })}
          </p>

          {groups.length === 0 ? (
            <div className="mt-6">
              <EmptyState onReset={handleReset} />
            </div>
          ) : (
            <div className="mt-2">
              {groups.map(([key, groupEvents]) => (
                <MonthGroup key={key} label={formatMonthYear(groupEvents[0].startsAt, lang)} events={groupEvents} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
