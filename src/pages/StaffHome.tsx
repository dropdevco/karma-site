import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { StaffEventCard } from '@/components/staff/StaffEventCard'
import { useStaffEvents } from '@/components/staff/useStaffEvents'

type LocationState = { confirmation?: 'created' | 'updated' } | null

export function StaffHome() {
  const { t } = useTranslation('staff')
  const { state, upcoming, past, reload } = useStaffEvents()
  const location = useLocation()
  const navigate = useNavigate()
  const [confirmation, setConfirmation] = useState<'created' | 'updated' | null>(
    (location.state as LocationState)?.confirmation ?? null,
  )
  const consumedConfirmation = useRef(false)

  useEffect(() => {
    if (consumedConfirmation.current || !confirmation) return
    consumedConfirmation.current = true
    void navigate(location.pathname, { replace: true, state: null })
    const timeout = window.setTimeout(() => setConfirmation(null), 6000)
    return () => window.clearTimeout(timeout)
  }, [confirmation, location.pathname, navigate])

  const hasAnyEvents = upcoming.length > 0 || past.length > 0

  return (
    <Section className="pb-24 pt-10 sm:pt-14">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Eyebrow>{t('home.eyebrow')}</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-bold text-karma-ink sm:text-4xl">
              {t('home.title')}
            </h1>
            <p className="mt-2 max-w-xl text-karma-ink-soft">{t('home.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink to="/staff/points" variant="secondary" size="md">
              {t('home.awardPoints')}
            </ButtonLink>
            <ButtonLink to="/staff/events/new" variant="primary" size="md">
              {t('home.newEvent')}
            </ButtonLink>
          </div>
        </div>

        {confirmation && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-karma-tan-dark/30 bg-karma-tan-light px-4 py-3 text-sm font-medium text-karma-ink"
          >
            {confirmation === 'created' ? t('home.justCreated') : t('home.justUpdated')}
          </div>
        )}

        <div className="mt-10">
          {state === 'loading' && (
            <p className="text-center text-karma-ink-soft" aria-busy="true">
              {t('home.loading')}
            </p>
          )}

          {(state === 'error' || state === 'offline') && (
            <div className="rounded-card border border-karma-red/30 bg-karma-red-soft p-6 text-center">
              <p className="font-medium text-karma-red-dark">
                {state === 'offline' ? t('home.offlineError') : t('home.loadError')}
              </p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={reload}>
                {t('home.retry')}
              </Button>
            </div>
          )}

          {state === 'ready' && !hasAnyEvents && (
            <div className="rounded-card border border-karma-tan-dark/25 bg-white p-10 text-center">
              <h2 className="font-display text-xl font-bold text-karma-ink">{t('home.empty.title')}</h2>
              <p className="mx-auto mt-2 max-w-md text-karma-ink-soft">{t('home.empty.body')}</p>
              <ButtonLink to="/staff/events/new" variant="primary" size="md" className="mt-6">
                {t('home.empty.cta')}
              </ButtonLink>
            </div>
          )}

          {state === 'ready' && hasAnyEvents && (
            <div className="flex flex-col gap-12">
              <div>
                <h2 className="font-display text-lg font-bold text-karma-ink">{t('home.upcomingSection')}</h2>
                {upcoming.length === 0 ? (
                  <p className="mt-3 text-karma-ink-soft">{t('home.noUpcoming')}</p>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {upcoming.map((entry) => (
                      <StaffEventCard key={entry.event.id} entry={entry} variant="upcoming" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-display text-lg font-bold text-karma-ink">{t('home.pastSection')}</h2>
                {past.length === 0 ? (
                  <p className="mt-3 text-karma-ink-soft">{t('home.noPast')}</p>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {past.map((entry) => (
                      <StaffEventCard key={entry.event.id} entry={entry} variant="past" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
