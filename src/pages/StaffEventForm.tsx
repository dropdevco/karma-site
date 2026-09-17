import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { BilingualPair } from '@/components/staff/BilingualPair'
import { StaffTextField } from '@/components/staff/StaffTextField'
import { StaffTextArea } from '@/components/staff/StaffTextArea'
import { StaffSelectField } from '@/components/staff/StaffSelectField'
import { slugify } from '@/components/staff/slug'
import { currentTimeZoneLabel, isoToDateTimeLocal } from '@/components/staff/dateTime'
import {
  EVENT_FORM_FIELD_ORDER,
  initialEventFormValues,
  type EventFormField,
  type EventFormValues,
} from '@/components/staff/eventFormTypes'
import { validateEventForm } from '@/components/staff/validateEventForm'
import { createEvent, setEventStatus, updateEvent } from '@/components/staff/submitEventForm'
import { supabase } from '@/lib/supabase'
import type { EventCategory, EventStatus } from '@/lib/database.types'

type LoadState = 'loading' | 'not-found' | 'error' | 'ready'
type SubmitStatus = 'idle' | 'submitting' | 'error'

const CATEGORY_OPTIONS: EventCategory[] = ['soccer', 'basketball', 'running', 'volleyball']

export function StaffEventForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { t } = useTranslation('staff')

  const [loadState, setLoadState] = useState<LoadState>(isEdit ? 'loading' : 'ready')
  const [values, setValues] = useState<EventFormValues>(initialEventFormValues)
  const [status, setStatus] = useState<EventStatus>('scheduled')
  const [errors, setErrors] = useState<ReturnType<typeof validateEventForm>>({})
  const [touched, setTouched] = useState<Partial<Record<EventFormField, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [submitErrorReason, setSubmitErrorReason] = useState<'offline' | 'permission' | 'unknown' | null>(null)
  const [errorAnnouncement, setErrorAnnouncement] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [statusActionPending, setStatusActionPending] = useState(false)
  const [statusActionError, setStatusActionError] = useState(false)

  const fieldRefs = useRef<Partial<Record<EventFormField, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>>(
    {},
  )

  useEffect(() => {
    if (!isEdit || !id) return
    let cancelled = false

    async function load() {
      setLoadState('loading')
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id as string)
        .maybeSingle()
      if (cancelled) return
      if (error) {
        setLoadState('error')
        return
      }
      if (!data) {
        setLoadState('not-found')
        return
      }
      setValues({
        slug: data.slug,
        title_en: data.title_en,
        title_es: data.title_es,
        description_en: data.description_en,
        description_es: data.description_es,
        category: data.category,
        starts_at: isoToDateTimeLocal(data.starts_at),
        ends_at: isoToDateTimeLocal(data.ends_at),
        venue_name: data.venue_name,
        venue_address: data.venue_address,
        capacity: String(data.capacity),
        donation_item_en: data.donation_item_en,
        donation_item_es: data.donation_item_es,
        donation_suggestion_en: data.donation_suggestion_en,
        donation_suggestion_es: data.donation_suggestion_es,
        beneficiary_en: data.beneficiary_en,
        beneficiary_es: data.beneficiary_es,
        recurring: data.recurring,
      })
      setStatus(data.status)
      setSlugTouched(true)
      setLoadState('ready')
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  function updateValue<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'title_en' && !slugTouched) {
        next.slug = slugify(String(value))
      }
      setErrors(validateEventForm(next, t))
      return next
    })
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true)
    updateValue('slug', value.toLowerCase())
  }

  function handleBlur(field: EventFormField) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function visibleError(field: EventFormField): string | undefined {
    return touched[field] || submitAttempted ? errors[field] : undefined
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitStatus === 'submitting') return

    setSubmitAttempted(true)
    const nextErrors = validateEventForm(values, t)
    setErrors(nextErrors)

    const invalidFields = EVENT_FORM_FIELD_ORDER.filter((field) => nextErrors[field])
    if (invalidFields.length > 0) {
      setErrorAnnouncement(t('form.errors.summary', { count: invalidFields.length }))
      fieldRefs.current[invalidFields[0]]?.focus()
      return
    }

    setErrorAnnouncement('')
    setSubmitStatus('submitting')
    setSubmitErrorReason(null)

    const result = isEdit && id ? await updateEvent(id, values) : await createEvent(values)

    if (!result.ok) {
      setSubmitStatus('error')
      setSubmitErrorReason(result.reason)
      return
    }

    void navigate('/staff', {
      replace: true,
      state: { confirmation: isEdit ? 'updated' : 'created' },
    })
  }

  async function handleStatusToggle() {
    if (!id) return
    const nextStatus: EventStatus = status === 'cancelled' ? 'scheduled' : 'cancelled'
    const confirmMessage =
      nextStatus === 'cancelled' ? t('form.actions.cancelConfirm') : t('form.actions.reactivateConfirm')
    if (!window.confirm(confirmMessage)) return

    setStatusActionPending(true)
    setStatusActionError(false)
    const result = await setEventStatus(id, nextStatus)
    setStatusActionPending(false)
    if (!result.ok) {
      setStatusActionError(true)
      return
    }
    setStatus(nextStatus)
  }

  if (loadState === 'loading') {
    return (
      <Section>
        <Container>
          <p className="text-center text-karma-ink-soft" aria-busy="true">
            {t('form.loading')}
          </p>
        </Container>
      </Section>
    )
  }

  if (loadState === 'not-found') {
    return (
      <Section>
        <Container className="text-center">
          <h1 className="font-display text-3xl font-bold text-karma-ink">{t('form.notFound.title')}</h1>
          <p className="mx-auto mt-3 max-w-md text-karma-ink-soft">{t('form.notFound.body')}</p>
          <ButtonLink to="/staff" variant="secondary" className="mt-6">
            {t('form.notFound.cta')}
          </ButtonLink>
        </Container>
      </Section>
    )
  }

  if (loadState === 'error') {
    return (
      <Section>
        <Container className="text-center">
          <h1 className="font-display text-3xl font-bold text-karma-ink">{t('form.loadError.title')}</h1>
          <p className="mx-auto mt-3 max-w-md text-karma-ink-soft">{t('form.loadError.body')}</p>
          <ButtonLink to="/staff" variant="secondary" className="mt-6">
            {t('form.notFound.cta')}
          </ButtonLink>
        </Container>
      </Section>
    )
  }

  const categoryOptions = CATEGORY_OPTIONS.map((value) => ({
    value,
    label: t(`categories.${value}`),
  }))

  return (
    <Section className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <Eyebrow>{t('form.eyebrow')}</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-bold text-karma-ink sm:text-4xl">
          {isEdit ? t('form.title.edit') : t('form.title.create')}
        </h1>

        {isEdit && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card border border-karma-tan-dark/25 bg-white p-4">
            <span
              className={
                status === 'cancelled'
                  ? 'rounded-full bg-karma-red-soft px-3 py-1 text-sm font-semibold text-karma-red-dark'
                  : 'rounded-full bg-karma-tan-light px-3 py-1 text-sm font-semibold text-karma-ink'
              }
            >
              {status === 'cancelled' ? t('form.status.cancelled') : t('form.status.scheduled')}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={statusActionPending}
              onClick={() => void handleStatusToggle()}
            >
              {status === 'cancelled' ? t('form.actions.reactivateEvent') : t('form.actions.cancelEvent')}
            </Button>
            {statusActionError && (
              <p role="alert" className="text-sm font-medium text-karma-red">
                {t('form.errors.generic')}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-10">
          <div aria-live="polite" role="status" className="sr-only">
            {errorAnnouncement}
          </div>

          {submitStatus === 'error' && (
            <div
              role="alert"
              className="rounded-xl border border-karma-red/40 bg-karma-red-soft px-4 py-3 text-sm font-medium text-karma-red-dark"
            >
              {submitErrorReason === 'permission'
                ? t('form.errors.permission')
                : submitErrorReason === 'offline'
                  ? t('form.errors.offline')
                  : t('form.errors.generic')}
            </div>
          )}

          <BilingualPair legend={t('form.sections.title')}>
            <StaffTextField
              id="title_en"
              label={t('form.fields.titleEn.label')}
              required
              value={values.title_en}
              onChange={(value) => updateValue('title_en', value)}
              onBlur={() => handleBlur('title_en')}
              error={visibleError('title_en')}
              ref={(el) => {
                fieldRefs.current.title_en = el
              }}
            />
            <StaffTextField
              id="title_es"
              label={t('form.fields.titleEs.label')}
              required
              value={values.title_es}
              onChange={(value) => updateValue('title_es', value)}
              onBlur={() => handleBlur('title_es')}
              error={visibleError('title_es')}
              ref={(el) => {
                fieldRefs.current.title_es = el
              }}
            />
          </BilingualPair>

          <StaffTextField
            id="slug"
            label={t('form.fields.slug.label')}
            hint={t('form.fields.slug.hint', { slug: values.slug || 'your-event' })}
            required
            value={values.slug}
            onChange={handleSlugChange}
            onBlur={() => handleBlur('slug')}
            error={visibleError('slug')}
            ref={(el) => {
              fieldRefs.current.slug = el
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <StaffSelectField
              id="category"
              label={t('form.fields.category.label')}
              placeholder={t('form.fields.category.placeholder')}
              required
              value={values.category}
              options={categoryOptions}
              onChange={(value) => updateValue('category', value as EventCategory)}
              onBlur={() => handleBlur('category')}
              error={visibleError('category')}
              selectRef={(el) => {
                fieldRefs.current.category = el
              }}
            />
            <StaffTextField
              id="capacity"
              label={t('form.fields.capacity.label')}
              hint={t('form.fields.capacity.hint')}
              required
              type="number"
              inputMode="numeric"
              min={1}
              max={10000}
              value={values.capacity}
              onChange={(value) => updateValue('capacity', value)}
              onBlur={() => handleBlur('capacity')}
              error={visibleError('capacity')}
              ref={(el) => {
                fieldRefs.current.capacity = el
              }}
            />
          </div>

          <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
            <legend className="mb-0 font-display text-base font-bold text-karma-ink">
              {t('form.sections.schedule')}
            </legend>
            <p className="-mt-1 text-sm text-karma-ink-soft">
              {t('form.fields.timezoneNote', { zone: currentTimeZoneLabel() })}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <StaffTextField
                id="starts_at"
                label={t('form.fields.startsAt.label')}
                required
                type="datetime-local"
                value={values.starts_at}
                onChange={(value) => updateValue('starts_at', value)}
                onBlur={() => handleBlur('starts_at')}
                error={visibleError('starts_at')}
                ref={(el) => {
                  fieldRefs.current.starts_at = el
                }}
              />
              <StaffTextField
                id="ends_at"
                label={t('form.fields.endsAt.label')}
                required
                type="datetime-local"
                value={values.ends_at}
                onChange={(value) => updateValue('ends_at', value)}
                onBlur={() => handleBlur('ends_at')}
                error={visibleError('ends_at')}
                ref={(el) => {
                  fieldRefs.current.ends_at = el
                }}
              />
            </div>
            <StaffTextField
              id="venue_name"
              label={t('form.fields.venueName.label')}
              required
              value={values.venue_name}
              onChange={(value) => updateValue('venue_name', value)}
              onBlur={() => handleBlur('venue_name')}
              error={visibleError('venue_name')}
              ref={(el) => {
                fieldRefs.current.venue_name = el
              }}
            />
            <StaffTextField
              id="venue_address"
              label={t('form.fields.venueAddress.label')}
              required
              value={values.venue_address}
              onChange={(value) => updateValue('venue_address', value)}
              onBlur={() => handleBlur('venue_address')}
              error={visibleError('venue_address')}
              ref={(el) => {
                fieldRefs.current.venue_address = el
              }}
            />
            <label className="flex min-h-11 cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={values.recurring}
                onChange={(event) => updateValue('recurring', event.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-karma-red"
              />
              <span className="text-sm font-medium text-karma-ink">
                {t('form.fields.recurring.label')}
                <span className="mt-0.5 block text-sm font-normal text-karma-ink-soft">
                  {t('form.fields.recurring.hint')}
                </span>
              </span>
            </label>
          </fieldset>

          <BilingualPair legend={t('form.sections.description')}>
            <StaffTextArea
              id="description_en"
              label={t('form.fields.descriptionEn.label')}
              required
              value={values.description_en}
              onChange={(value) => updateValue('description_en', value)}
              onBlur={() => handleBlur('description_en')}
              error={visibleError('description_en')}
              ref={(el) => {
                fieldRefs.current.description_en = el
              }}
            />
            <StaffTextArea
              id="description_es"
              label={t('form.fields.descriptionEs.label')}
              required
              value={values.description_es}
              onChange={(value) => updateValue('description_es', value)}
              onBlur={() => handleBlur('description_es')}
              error={visibleError('description_es')}
              ref={(el) => {
                fieldRefs.current.description_es = el
              }}
            />
          </BilingualPair>

          <div className="flex flex-col gap-6 rounded-card border border-karma-tan-dark/25 bg-white p-5">
            <h2 className="font-display text-base font-bold text-karma-ink">{t('form.sections.donation')}</h2>
            <BilingualPair legend={t('form.fields.donationItemEn.groupLabel')}>
              <StaffTextField
                id="donation_item_en"
                label={t('form.fields.donationItemEn.label')}
                required
                value={values.donation_item_en}
                onChange={(value) => updateValue('donation_item_en', value)}
                onBlur={() => handleBlur('donation_item_en')}
                error={visibleError('donation_item_en')}
                ref={(el) => {
                  fieldRefs.current.donation_item_en = el
                }}
              />
              <StaffTextField
                id="donation_item_es"
                label={t('form.fields.donationItemEs.label')}
                required
                value={values.donation_item_es}
                onChange={(value) => updateValue('donation_item_es', value)}
                onBlur={() => handleBlur('donation_item_es')}
                error={visibleError('donation_item_es')}
                ref={(el) => {
                  fieldRefs.current.donation_item_es = el
                }}
              />
            </BilingualPair>
            <BilingualPair legend={t('form.fields.donationSuggestionEn.groupLabel')}>
              <StaffTextField
                id="donation_suggestion_en"
                label={t('form.fields.donationSuggestionEn.label')}
                required
                value={values.donation_suggestion_en}
                onChange={(value) => updateValue('donation_suggestion_en', value)}
                onBlur={() => handleBlur('donation_suggestion_en')}
                error={visibleError('donation_suggestion_en')}
                ref={(el) => {
                  fieldRefs.current.donation_suggestion_en = el
                }}
              />
              <StaffTextField
                id="donation_suggestion_es"
                label={t('form.fields.donationSuggestionEs.label')}
                required
                value={values.donation_suggestion_es}
                onChange={(value) => updateValue('donation_suggestion_es', value)}
                onBlur={() => handleBlur('donation_suggestion_es')}
                error={visibleError('donation_suggestion_es')}
                ref={(el) => {
                  fieldRefs.current.donation_suggestion_es = el
                }}
              />
            </BilingualPair>
            <BilingualPair legend={t('form.fields.beneficiaryEn.groupLabel')}>
              <StaffTextField
                id="beneficiary_en"
                label={t('form.fields.beneficiaryEn.label')}
                required
                value={values.beneficiary_en}
                onChange={(value) => updateValue('beneficiary_en', value)}
                onBlur={() => handleBlur('beneficiary_en')}
                error={visibleError('beneficiary_en')}
                ref={(el) => {
                  fieldRefs.current.beneficiary_en = el
                }}
              />
              <StaffTextField
                id="beneficiary_es"
                label={t('form.fields.beneficiaryEs.label')}
                required
                value={values.beneficiary_es}
                onChange={(value) => updateValue('beneficiary_es', value)}
                onBlur={() => handleBlur('beneficiary_es')}
                error={visibleError('beneficiary_es')}
                ref={(el) => {
                  fieldRefs.current.beneficiary_es = el
                }}
              />
            </BilingualPair>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ButtonLink to="/staff" variant="ghost" size="md">
              {t('form.actions.discard')}
            </ButtonLink>
            <Button type="submit" variant="primary" size="md" disabled={submitStatus === 'submitting'}>
              {submitStatus === 'submitting' ? t('form.actions.saving') : t('form.actions.save')}
            </Button>
          </div>
        </form>
      </Container>
    </Section>
  )
}
