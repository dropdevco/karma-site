import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { isOffline } from '@/lib/supabase'
import type { ProfileUpdate } from '@/lib/database.types'
import { TextField } from './TextField'
import { RadioGroupField } from './RadioGroupField'
import { CheckboxGroupField } from './CheckboxGroupField'
import { CheckboxField } from './CheckboxField'
import { SelectField } from './SelectField'
import { validateProfileForm } from './validateProfileForm'
import {
  PROFILE_FIELD_ORDER,
  formValuesToPatch,
  type ActivityKey,
  type HeardAboutKey,
  type LanguageCode,
  type ProfileFormErrors,
  type ProfileFormField,
  type ProfileFormValues,
} from './formTypes'

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

interface ProfileFormProps {
  initialValues: ProfileFormValues
  submitLabel: string
  submittingLabel: string
  savedMessage: string
  errorMessage: string
  offlineMessage: string
  onSave: (patch: ProfileUpdate) => Promise<void>
  onSaved?: () => void
}

const fieldsetClass = 'm-0 flex flex-col gap-6 border-0 p-0'
const legendClass = 'mb-1 w-full font-display text-xl font-bold text-karma-ink'

export function ProfileForm({
  initialValues,
  submitLabel,
  submittingLabel,
  savedMessage,
  errorMessage,
  offlineMessage,
  onSave,
  onSaved,
}: ProfileFormProps) {
  const { t } = useTranslation('join')

  const [values, setValues] = useState<ProfileFormValues>(initialValues)
  const [errors, setErrors] = useState<ProfileFormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<ProfileFormField, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorAnnouncement, setErrorAnnouncement] = useState('')
  const [saveErrorText, setSaveErrorText] = useState('')

  const fieldRefs = useRef<Partial<Record<ProfileFormField, HTMLInputElement | null>>>({})

  function updateValue<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [key]: value }
      setErrors(validateProfileForm(next, t))
      return next
    })
    setStatus((prev) => (prev === 'success' ? 'idle' : prev))
  }

  function handleBlur(field: ProfileFormField) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function visibleError(field: ProfileFormField): string | undefined {
    return touched[field] || submitAttempted ? errors[field] : undefined
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return

    setSubmitAttempted(true)
    const nextErrors = validateProfileForm(values, t)
    setErrors(nextErrors)

    const invalidFields = PROFILE_FIELD_ORDER.filter((field) => nextErrors[field])
    if (invalidFields.length > 0) {
      setErrorAnnouncement(t('profile.errors.summary', { count: invalidFields.length }))
      fieldRefs.current[invalidFields[0]]?.focus()
      return
    }

    setErrorAnnouncement('')
    setStatus('submitting')
    try {
      await onSave(formValuesToPatch(values))
      setStatus('success')
      onSaved?.()
    } catch (err) {
      setSaveErrorText(isOffline(err) ? offlineMessage : errorMessage)
      setStatus('error')
    }
  }

  const languageOptions = [
    { value: 'en' as LanguageCode, label: t('profile.fields.preferredLanguage.options.en') },
    { value: 'es' as LanguageCode, label: t('profile.fields.preferredLanguage.options.es') },
  ]

  const activityOptions: { value: ActivityKey; label: string }[] = [
    { value: 'soccer', label: t('profile.fields.activities.options.soccer') },
    { value: 'basketball', label: t('profile.fields.activities.options.basketball') },
    { value: 'running', label: t('profile.fields.activities.options.running') },
    { value: 'volleyball', label: t('profile.fields.activities.options.volleyball') },
    { value: 'other', label: t('profile.fields.activities.options.other') },
  ]

  const heardAboutOptions: { value: HeardAboutKey; label: string }[] = [
    { value: 'friend', label: t('profile.fields.heardAbout.options.friend') },
    { value: 'event', label: t('profile.fields.heardAbout.options.event') },
    { value: 'social', label: t('profile.fields.heardAbout.options.social') },
    { value: 'search', label: t('profile.fields.heardAbout.options.search') },
    { value: 'other', label: t('profile.fields.heardAbout.options.other') },
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
          {saveErrorText}
        </div>
      )}

      {status === 'success' && (
        <div
          role="status"
          className="rounded-xl border border-karma-tan-dark/30 bg-karma-tan-light/60 px-4 py-3 text-sm font-medium text-karma-ink"
        >
          {savedMessage}
        </div>
      )}

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t('profile.sections.about')}</legend>

        <TextField
          id="fullName"
          label={t('profile.fields.fullName.label')}
          placeholder={t('profile.fields.fullName.placeholder')}
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

        <TextField
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          label={t('profile.fields.phone.label')}
          placeholder={t('profile.fields.phone.placeholder')}
          required
          value={values.phone}
          error={visibleError('phone')}
          onChange={(value) => updateValue('phone', value)}
          onBlur={() => handleBlur('phone')}
          ref={(el) => {
            fieldRefs.current.phone = el
          }}
        />

        <RadioGroupField
          name="preferredLanguage"
          legend={t('profile.fields.preferredLanguage.legend')}
          hint={t('profile.fields.preferredLanguage.hint')}
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
          legend={t('profile.fields.activities.legend')}
          hint={t('profile.fields.activities.hint')}
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
        <legend className={legendClass}>{t('profile.sections.emergency')}</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            id="emergencyName"
            autoComplete="off"
            label={t('profile.fields.emergencyName.label')}
            placeholder={t('profile.fields.emergencyName.placeholder')}
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
            label={t('profile.fields.emergencyPhone.label')}
            placeholder={t('profile.fields.emergencyPhone.placeholder')}
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
        <legend className={legendClass}>{t('profile.sections.eligibility')}</legend>

        <TextField
          id="dateOfBirth"
          type="date"
          autoComplete="bday"
          label={t('profile.fields.dateOfBirth.label')}
          hint={t('profile.fields.dateOfBirth.hint')}
          required
          value={values.dateOfBirth}
          error={visibleError('dateOfBirth')}
          onChange={(value) => updateValue('dateOfBirth', value)}
          onBlur={() => handleBlur('dateOfBirth')}
          ref={(el) => {
            fieldRefs.current.dateOfBirth = el
          }}
        />

        <CheckboxField
          id="photoConsent"
          label={t('profile.fields.photoConsent.label')}
          description={t('profile.fields.photoConsent.description')}
          checked={values.photoConsent}
          onChange={(value) => updateValue('photoConsent', value)}
        />
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t('profile.sections.preferences')}</legend>

        <CheckboxField
          id="reminderOptIn"
          label={t('profile.fields.reminderOptIn.label')}
          description={t('profile.fields.reminderOptIn.description')}
          checked={values.reminderOptIn}
          onChange={(value) => updateValue('reminderOptIn', value)}
        />

        <SelectField
          id="heardAbout"
          label={t('profile.fields.heardAbout.label')}
          placeholder={t('profile.fields.heardAbout.placeholder')}
          value={values.heardAbout}
          options={heardAboutOptions}
          onChange={(value) => updateValue('heardAbout', value as HeardAboutKey | '')}
        />
      </fieldset>

      <Button type="submit" size="lg" disabled={status === 'submitting'} className="w-full sm:w-auto">
        {status === 'submitting' ? submittingLabel : submitLabel}
      </Button>
    </form>
  )
}
