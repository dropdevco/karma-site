import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Section, Container } from '@/components/ui/Section'
import { ButtonLink, Button } from '@/components/ui/Button'
import { CategoryVisual } from '@/components/events/CategoryVisual'
import { ErrorState } from '@/components/events/ErrorState'
import { formatDateLong, formatTimeRange, toLanguageCode } from '@/components/events/dateUtils'
import { useAuth } from '@/auth/useAuth'
import { fetchMyRegistrations, cancelMyRegistration, type MyRegistration } from '@/lib/eventsApi'

export function MyEvents() {
  const { t, i18n } = useTranslation('events')
  const lang = toLanguageCode(i18n.resolvedLanguage)
  const { user } = useAuth()

  const [registrations, setRegistrations] = useState<MyRegistration[] | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [liveMessage, setLiveMessage] = useState('')

  const load = useCallback(() => {
    if (!user) return
    setStatus('loading')
    fetchMyRegistrations(user.id)
      .then((data) => {
        setRegistrations(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  async function handleCancel(registration: MyRegistration) {
    setPendingId(registration.registrationId)
    const result = await cancelMyRegistration(registration.event.id)
    setPendingId(null)
    if (result.ok) {
      setLiveMessage(t('register.announced.cancelled'))
      load()
    }
  }

  const now = Date.now()
  const upcoming = (registrations ?? [])
    .filter((reg) => new Date(reg.event.endsAt).getTime() >= now)
    .sort((a, b) => new Date(a.event.startsAt).getTime() - new Date(b.event.startsAt).getTime())
  const past = (registrations ?? [])
    .filter((reg) => new Date(reg.event.endsAt).getTime() < now)
    .sort((a, b) => new Date(b.event.startsAt).getTime() - new Date(a.event.startsAt).getTime())

  function statusLabel(reg: MyRegistration) {
    return reg.status === 'waitlisted' ? t('myEvents.statusWaitlisted') : t('myEvents.statusRegistered')
  }

  function renderRow(reg: MyRegistration, allowCancel: boolean) {
    return (
      <li
        key={reg.registrationId}
        className="flex flex-col gap-4 rounded-card border border-karma-tan-dark/25 bg-white p-4 sm:flex-row sm:items-center"
      >
        <Link to={`/events/${reg.event.slug}`} className="flex flex-1 items-center gap-4">
          <CategoryVisual category={reg.event.category} className="h-16 w-16 shrink-0 rounded-card" />
          <div>
            <p className="font-display text-base font-bold text-karma-ink hover:text-karma-red-dark">
              {reg.event.title[lang]}
            </p>
            <time dateTime={reg.event.startsAt} className="block text-sm text-karma-ink-soft">
              {formatDateLong(reg.event.startsAt, lang)} &middot; {formatTimeRange(reg.event.startsAt, reg.event.endsAt, lang)}
            </time>
            <span
              className={
                reg.status === 'waitlisted'
                  ? 'mt-1 inline-flex rounded-full bg-karma-tan-light px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-karma-ink-soft'
                  : 'mt-1 inline-flex rounded-full bg-karma-red-soft px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-karma-red-dark'
              }
            >
              {statusLabel(reg)}
            </span>
          </div>
        </Link>
        {allowCancel && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void handleCancel(reg)}
            disabled={pendingId === reg.registrationId}
          >
            {t('myEvents.cancel')}
          </Button>
        )}
      </li>
    )
  }

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <div role="status" aria-live="polite" className="sr-only">
          {liveMessage}
        </div>

        <h1 className="font-display text-3xl font-bold text-karma-ink sm:text-4xl">{t('myEvents.title')}</h1>
        <p className="mt-2 max-w-xl text-karma-ink-soft">{t('myEvents.subtitle')}</p>

        {status === 'loading' && (
          <p className="mt-8 text-karma-ink-soft" aria-busy="true">
            {t('myEvents.loading')}
          </p>
        )}

        {status === 'error' && (
          <div className="mt-8">
            <ErrorState
              title={t('myEvents.error.title')}
              body={t('myEvents.error.body')}
              retryLabel={t('myEvents.error.retry')}
              onRetry={load}
            />
          </div>
        )}

        {status === 'ready' && upcoming.length === 0 && past.length === 0 && (
          <div className="mt-8 rounded-card border border-dashed border-karma-tan-dark/50 bg-white/50 px-6 py-16 text-center">
            <p className="font-display text-2xl font-bold text-karma-ink">{t('myEvents.empty.title')}</p>
            <p className="mx-auto mt-3 max-w-md text-karma-ink-soft">{t('myEvents.empty.body')}</p>
            <ButtonLink to="/events" className="mt-6">
              {t('myEvents.empty.cta')}
            </ButtonLink>
          </div>
        )}

        {status === 'ready' && upcoming.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-karma-ink-soft">
              {t('myEvents.upcomingHeading')}
            </h2>
            <ul className="mt-3 flex flex-col gap-3">{upcoming.map((reg) => renderRow(reg, true))}</ul>
          </div>
        )}

        {status === 'ready' && past.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-karma-ink-soft">
              {t('myEvents.pastHeading')}
            </h2>
            <ul className="mt-3 flex flex-col gap-3">{past.map((reg) => renderRow(reg, false))}</ul>
          </div>
        )}
      </Container>
    </Section>
  )
}
