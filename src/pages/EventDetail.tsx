import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { CategoryVisual } from '@/components/events/CategoryVisual'
import { CapacityBadge } from '@/components/events/CapacityBadge'
import { AddToCalendarButton } from '@/components/events/AddToCalendarButton'
import { ShareButton } from '@/components/events/ShareButton'
import { formatDateLong, formatTimeRange, toLanguageCode } from '@/components/events/dateUtils'
import { buildMapsUrl } from '@/components/events/mapsUrl'
import { findEventBySlug } from '@/data/events'

export function EventDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { t, i18n } = useTranslation('events')
  const lang = toLanguageCode(i18n.resolvedLanguage)
  const event = slug ? findEventBySlug(slug) : undefined

  if (!event) {
    return (
      <Section>
        <Container className="text-center">
          <h1 className="font-display text-3xl font-bold text-karma-ink">{t('notFound.title')}</h1>
          <p className="mx-auto mt-3 max-w-md text-karma-ink-soft">{t('notFound.body')}</p>
          <ButtonLink to="/events" variant="secondary" className="mt-6">
            {t('notFound.cta')}
          </ButtonLink>
        </Container>
      </Section>
    )
  }

  const mapsUrl = buildMapsUrl(event.venue.name, event.venue.address)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <>
      <Section className="pb-8 pt-10 sm:pt-14">
        <Container>
          <Link
            to="/events"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-karma-ink-soft hover:text-karma-red"
          >
            &larr; {t('detail.back')}
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Eyebrow>{t(`categories.${event.category}`)}</Eyebrow>
                {event.recurring && (
                  <span className="rounded-full bg-karma-tan-light px-2 py-0.5 text-[11px] font-semibold text-karma-ink-soft">
                    {t('recurringBadge')}
                  </span>
                )}
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold text-karma-ink sm:text-4xl">{event.title[lang]}</h1>
              <p className="mt-4 max-w-xl text-karma-ink-soft">{event.description[lang]}</p>

              <CategoryVisual category={event.category} className="mt-6 h-40 w-full rounded-card sm:h-56" />
            </div>

            <aside className="flex flex-col gap-6 rounded-card border border-karma-tan-dark/25 bg-white p-6">
              <div>
                <h2 className="font-display text-xs font-bold uppercase tracking-widest text-karma-ink-soft">
                  {t('detail.dateTime')}
                </h2>
                <time dateTime={event.startsAt} className="mt-1 block font-display text-lg font-bold text-karma-ink">
                  {formatDateLong(event.startsAt, lang)}
                </time>
                <p className="text-karma-ink-soft">{formatTimeRange(event.startsAt, event.endsAt, lang)}</p>
              </div>

              <div>
                <h2 className="font-display text-xs font-bold uppercase tracking-widest text-karma-ink-soft">
                  {t('detail.venue')}
                </h2>
                <p className="mt-1 font-semibold text-karma-ink">{event.venue.name}</p>
                <p className="text-sm text-karma-ink-soft">{event.venue.address}</p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-karma-red hover:text-karma-red-dark"
                >
                  {t('detail.getDirections')} &rarr;
                </a>
              </div>

              <div>
                <h2 className="font-display text-xs font-bold uppercase tracking-widest text-karma-ink-soft">
                  {t('detail.capacityLabel')}
                </h2>
                <p className="mt-1 text-sm text-karma-ink-soft">
                  {t('detail.spotsTaken', { taken: event.spotsTaken, capacity: event.capacity })}
                </p>
                <CapacityBadge spotsTaken={event.spotsTaken} capacity={event.capacity} className="mt-2" />
              </div>

              <div className="flex flex-col gap-3 border-t border-karma-tan-dark/20 pt-4">
                <AddToCalendarButton event={event} lang={lang} />
                <ShareButton title={event.title[lang]} url={shareUrl} />
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-card bg-karma-tan-light/60 p-6">
              <h2 className="font-display text-lg font-bold text-karma-ink">{t('detail.whatToBring')}</h2>
              <p className="mt-2 font-semibold text-karma-ink">{event.donation.itemType[lang]}</p>
              <p className="mt-1 text-sm text-karma-ink-soft">{event.donation.suggestion[lang]}</p>
            </div>
            <div className="rounded-card bg-karma-red-soft/60 p-6">
              <h2 className="font-display text-lg font-bold text-karma-ink">{t('detail.whoItHelps')}</h2>
              <p className="mt-2 text-karma-ink-soft">
                {t('detail.helpsIntro')} <span className="font-semibold text-karma-ink">{event.beneficiary[lang]}</span>.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-card border-2 border-karma-red/20 bg-white p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-karma-ink">{t('detail.register')}</h2>
            <p className="mt-2 max-w-xl text-karma-ink-soft">{t('detail.registerBody')}</p>
            <ButtonLink to="/join" className="mt-4">
              {t('detail.registerSoon')}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  )
}
