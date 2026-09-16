import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { TextField } from './TextField'
import { RadioGroupField } from './RadioGroupField'
import { CheckboxGroupField } from './CheckboxGroupField'
import { CheckboxField } from './CheckboxField'
import { SelectField } from './SelectField'
import { WaiverPanel } from './WaiverPanel'
import { SuccessPanel } from './SuccessPanel'
import { submitJoinRequest } from './submitJoinRequest'
import { validateJoinForm } from './validateJoinForm'
import {
  JOIN_FORM_FIELD_ORDER,
  initialJoinFormValues,
  type ActivityKey,
  type HeardAboutKey,
  type JoinFormErrors,
  type JoinFormField,
  type JoinFormValues,
  type LanguageCode,
} from './formTypes'

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

const fieldsetClass = 'm-0 flex flex-col gap-6 border-0 p-0'
const legendClass = 'mb-1 w-full font-display text-xl font-bold text-karma-ink'

export function JoinForm() {
  const { t } = useTranslation('join')

  const [values, setValues] = useState<JoinFormValues>(initialJoinFormValues)
  const [errors, setErrors] = useState<JoinFormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<JoinFormField, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorAnnouncement, setErrorAnnouncement] = useState('')

  const fieldRefs = useRef<Partial<Record<JoinFormField, HTMLInputElement | null>>>({})

  function updateValue<K extends keyof JoinFormValues>(key: K, value: JoinFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [key]: value }
      setErrors(validateJoinForm(next, t))
      return next
    })
  }

  function handleBlur(field: JoinFormField) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function visibleError(field: JoinFormField): string | undefined {
    return touched[field] || submitAttempted ? errors[field] : undefined
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return

    setSubmitAttempted(true)
    const nextErrors = validateJoinForm(values, t)
    setErrors(nextErrors)

    const invalidFields = JOIN_FORM_FIELD_ORDER.filter((field) => nextErrors[field])
    if (invalidFields.length > 0) {
      setErrorAnnouncement(t('form.errors.summary', { count: invalidFields.length }))
      fieldRefs.current[invalidFields[0]]?.focus()
      return
    }

    setErrorAnnouncement('')
    setStatus('submitting')
    try {
      await submitJoinRequest(values)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  function handleReset() {
    setValues(initialJoinFormValues)
    setErrors({})
    setTouched({})
    setSubmitAttempted(false)
    setErrorAnnouncement('')
    setStatus('idle')
  }

  if (status === 'success') {
    return <SuccessPanel name={values.fullName.trim()} email={values.email.trim()} onReset={handleReset} />
  }

  const languageOptions = [
    { value: 'en' as LanguageCode, label: t('form.fields.preferredLanguage.options.en') },
    { value: 'es' as LanguageCode, label: t('form.fields.preferredLanguage.options.es') },
  ]

  const activityOptions = [
    { value: 'soccer' as ActivityKey, label: t('form.fields.activities.options.soccer') },
    { value: 'basketball' as ActivityKey, label: t('form.fields.activities.options.basketball') },
    { value: 'running' as ActivityKey, label: t('form.fields.activities.options.running') },
    { value: 'other' as ActivityKey, label: t('form.fields.activities.options.other') },
  ]

  const heardAboutOptions = [
    { value: 'friend' as HeardAboutKey, label: t('form.fields.heardAbout.options.friend') },
    { value: 'event' as HeardAboutKey, label: t('form.fields.heardAbout.options.event') },
    { value: 'social' as HeardAboutKey, label: t('form.fields.heardAbout.options.social') },
    { value: 'search' as HeardAboutKey, label: t('form.fields.heardAbout.options.search') },
    { value: 'other' as HeardAboutKey, label: t('form.fields.heardAbout.options.other') },
  ]

  const waiverParagraphs = [
    t('form.fields.waiver.body1'),
    t('form.fields.waiver.body2'),
    t('form.fields.waiver.body3'),
    t('form.fields.waiver.body4'),
  ]

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
      {/* Announces the error count to screen reader users after a failed submit. */}
      <div aria-live="polite" role="status" className="sr-only">
        {errorAnnouncement}
      </div>

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-xl border border-karma-red/40 bg-karma-red-soft px-4 py-3 text-sm font-medium text-karma-red-dark"
        >
          {t('form.submitError')}
        </div>
      )}

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t('form.sections.about')}</legend>

        <TextField
          id="fullName"
          label={t('form.fields.fullName.label')}
          placeholder={t('form.fields.fullName.placeholder')}
          autoComplete="name"
          required
          value={values.fullName}
          error={visibleError('fullName')}
          onChange={(value) => updateValue('fullName', value)}
          onBlur={() => handleBlur('fullName')}
          ref={(el) => {
            fieldRefs.current.fullName = el
          }}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            label={t('form.fields.email.label')}
            placeholder={t('form.fields.email.placeholder')}
            required
            value={values.email}
            error={visibleError('email')}
            onChange={(value) => updateValue('email', value)}
            onBlur={() => handleBlur('email')}
            ref={(el) => {
              fieldRefs.current.email = el
            }}
          />
          <TextField
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            label={t('form.fields.phone.label')}
            placeholder={t('form.fields.phone.placeholder')}
            required
            value={values.phone}
            error={visibleError('phone')}
            onChange={(value) => updateValue('phone', value)}
            onBlur={() => handleBlur('phone')}
            ref={(el) => {
              fieldRefs.current.phone = el
            }}
          />
        </div>

        <RadioGroupField
          name="preferredLanguage"
          legend={t('form.fields.preferredLanguage.legend')}
          hint={t('form.fields.preferredLanguage.hint')}
          required
          options={languageOptions}
          value={values.preferredLanguage}
          error={visibleError('preferredLanguage')}
          onChange={(value) => updateValue('preferredLanguage', value)}
          onBlur={() => handleBlur('preferredLanguage')}
          firstOptionRef={(el) => {
            fieldRefs.current.preferredLanguage = el
          }}
        />

        <CheckboxGroupField
          name="activities"
          legend={t('form.fields.activities.legend')}
          hint={t('form.fields.activities.hint')}
          required
          options={activityOptions}
          values={values.activities}
          error={visibleError('activities')}
          onChange={(value) => updateValue('activities', value)}
          onBlur={() => handleBlur('activities')}
          firstOptionRef={(el) => {
            fieldRefs.current.activities = el
          }}
        />
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t('form.sections.emergency')}</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            id="emergencyName"
            autoComplete="off"
            label={t('form.fields.emergencyName.label')}
            placeholder={t('form.fields.emergencyName.placeholder')}
            required
            value={values.emergencyName}
            error={visibleError('emergencyName')}
            onChange={(value) => updateValue('emergencyName', value)}
            onBlur={() => handleBlur('emergencyName')}
            ref={(el) => {
              fieldRefs.current.emergencyName = el
            }}
          />
          <TextField
            id="emergencyPhone"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            label={t('form.fields.emergencyPhone.label')}
            placeholder={t('form.fields.emergencyPhone.placeholder')}
            required
            value={values.emergencyPhone}
            error={visibleError('emergencyPhone')}
            onChange={(value) => updateValue('emergencyPhone', value)}
            onBlur={() => handleBlur('emergencyPhone')}
            ref={(el) => {
              fieldRefs.current.emergencyPhone = el
            }}
          />
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t('form.sections.eligibility')}</legend>

        <TextField
          id="dateOfBirth"
          type="date"
          autoComplete="bday"
          label={t('form.fields.dateOfBirth.label')}
          hint={t('form.fields.dateOfBirth.hint')}
          required
          value={values.dateOfBirth}
          error={visibleError('dateOfBirth')}
          onChange={(value) => updateValue('dateOfBirth', value)}
          onBlur={() => handleBlur('dateOfBirth')}
          ref={(el) => {
            fieldRefs.current.dateOfBirth = el
          }}
        />

        <WaiverPanel
          legend={t('form.fields.waiver.legend')}
          paragraphs={waiverParagraphs}
          checkboxLabel={t('form.fields.waiver.checkboxLabel')}
          checked={values.waiverAccepted}
          error={visibleError('waiverAccepted')}
          onChange={(value) => updateValue('waiverAccepted', value)}
          onBlur={() => handleBlur('waiverAccepted')}
          inputRef={(el) => {
            fieldRefs.current.waiverAccepted = el
          }}
        />

        <CheckboxField
          id="photoConsent"
          label={t('form.fields.photoConsent.label')}
          description={t('form.fields.photoConsent.description')}
          checked={values.photoConsent}
          onChange={(value) => updateValue('photoConsent', value)}
        />
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t('form.sections.preferences')}</legend>

        <CheckboxField
          id="emailOptIn"
          label={t('form.fields.emailOptIn.label')}
          description={t('form.fields.emailOptIn.description')}
          checked={values.emailOptIn}
          onChange={(value) => updateValue('emailOptIn', value)}
        />

        <SelectField
          id="heardAbout"
          label={t('form.fields.heardAbout.label')}
          placeholder={t('form.fields.heardAbout.placeholder')}
          value={values.heardAbout}
          options={heardAboutOptions}
          onChange={(value) => updateValue('heardAbout', value as HeardAboutKey | '')}
        />
      </fieldset>

      <Button type="submit" size="lg" disabled={status === 'submitting'} className="w-full sm:w-auto">
        {status === 'submitting' ? t('form.submitting') : t('form.submit')}
      </Button>
    </form>
  )
}
