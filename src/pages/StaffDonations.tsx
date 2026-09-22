import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { supabase, isOffline } from '@/lib/supabase'
import type { DonationRow, EventRow } from '@/lib/database.types'
import { formatDateLong, formatTimeRange, toLanguageCode } from '@/components/events/dateUtils'
import { DonationForm } from '@/components/staff-donations/DonationForm'
import { DonationList, type DonationsErrorReason, type DonationsLoadState } from '@/components/staff-donations/DonationList'
import { emptyDonationFormValues } from '@/components/staff-donations/validateDonationForm'

type EventLoadState = 'loading' | 'not-found' | 'error' | 'ready'
type EventErrorReason = 'offline' | 'unknown'

export function StaffDonations() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation('staffDonations')
  const lang = toLanguageCode(i18n.resolvedLanguage)

  const [eventLoadState, setEventLoadState] = useState<EventLoadState>('loading')
  const [eventErrorReason, setEventErrorReason] = useState<EventErrorReason | null>(null)
  const [event, setEvent] = useState<EventRow | null>(null)

  const [donationsLoadState, setDonationsLoadState] = useState<DonationsLoadState>('loading')
  const [donationsErrorReason, setDonationsErrorReason] = useState<DonationsErrorReason | null>(null)
  const [donations, setDonations] = useState<DonationRow[]>([])

  const loadEvent = useCallback(async () => {
    if (!id) {
      setEventLoadState('not-found')
      return
    }
    setEventLoadState('loading')
    setEventErrorReason(null)
    try {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
      if (error) throw error
      if (!data) {
        setEventLoadState('not-found')
        return
      }
      setEvent(data)
      setEventLoadState('ready')
    } catch (error) {
      setEventLoadState('error')
      setEventErrorReason(isOffline(error) ? 'offline' : 'unknown')
    }
  }, [id])

  const loadDonations = useCallback(async () => {
    if (!id) return
    setDonationsLoadState('loading')
    setDonationsErrorReason(null)
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('event_id', id)
        .order('logged_at', { ascending: false })
      if (error) throw error
      setDonations(data ?? [])
      setDonationsLoadState('ready')
    } catch (error) {
      setDonationsLoadState('error')
      setDonationsErrorReason(isOffline(error) ? 'offline' : 'unknown')
    }
  }, [id])

  useEffect(() => {
    void loadEvent()
    void loadDonations()
  }, [loadEvent, loadDonations])

  function handleCreated(donation: DonationRow) {
    setDonations((prev) => [donation, ...prev])
  }

  function handleUpdated(updated: DonationRow) {
    setDonations((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)))
  }

  if (eventLoadState === 'loading') {
    return (
      <Section>
        <Container>
          <p className="text-center text-karma-ink-soft" aria-busy="true">
            {t('header.loading')}
          </p>
        </Container>
      </Section>
    )
  }

  if (eventLoadState === 'not-found') {
    return (
      <Section>
        <Container className="text-center">
          <h1 className="font-display text-3xl font-bold text-karma-ink">{t('header.notFound.title')}</h1>
          <p className="mx-auto mt-3 max-w-md text-karma-ink-soft">{t('header.notFound.body')}</p>
          <ButtonLink to="/staff" variant="secondary" className="mt-6">
            {t('header.notFound.cta')}
          </ButtonLink>
        </Container>
      </Section>
    )
  }

  if (eventLoadState === 'error' || !event) {
    return (
      <Section>
        <Container className="text-center">
          <h1 className="font-display text-3xl font-bold text-karma-ink">{t('header.loadError.title')}</h1>
          <p className="mx-auto mt-3 max-w-md text-karma-ink-soft">
            {eventErrorReason === 'offline' ? t('header.loadError.offlineBody') : t('header.loadError.body')}
          </p>
          <ButtonLink to="/staff" variant="secondary" className="mt-6">
            {t('header.loadError.cta')}
          </ButtonLink>
        </Container>
      </Section>
    )
  }

  const title = lang === 'es' ? event.title_es : event.title_en

  return (
    <Section className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <Eyebrow>{t('header.eyebrow')}</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-bold text-karma-ink sm:text-4xl">{title}</h1>
        <p className="mt-1 text-sm font-medium text-karma-ink">{formatDateLong(event.starts_at, lang)}</p>
        <p className="text-sm text-karma-ink-soft">{formatTimeRange(event.starts_at, event.ends_at, lang)}</p>
        <p className="text-sm text-karma-ink-soft">{event.venue_name}</p>
        <p className="mt-4 text-karma-ink-soft">{t('subtitle')}</p>

        <div className="mt-8 rounded-card border border-karma-tan-dark/25 bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-bold text-karma-ink">{t('form.addTitle')}</h2>
          <DonationForm
            mode="create"
            idPrefix="new-donation"
            eventId={id ?? ''}
            initialValues={emptyDonationFormValues}
            onSaved={handleCreated}
          />
        </div>

        <div className="mt-10">
          <h2 className="mb-4 font-display text-lg font-bold text-karma-ink">{t('list.title')}</h2>
          <DonationList
            eventId={id ?? ''}
            lang={lang}
            loadState={donationsLoadState}
            errorReason={donationsErrorReason}
            donations={donations}
            onRetry={() => void loadDonations()}
            onUpdated={handleUpdated}
          />
        </div>
      </Container>
    </Section>
  )
}
