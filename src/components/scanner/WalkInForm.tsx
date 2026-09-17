import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

export interface WalkInFormValues {
  fullName: string
  email: string
  phone: string
  emergencyContactName: string
  emergencyContactPhone: string
  confirmedAdult: boolean
  waiverAcknowledged: boolean
}

const emptyValues: WalkInFormValues = {
  fullName: '',
  email: '',
  phone: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  confirmedAdult: false,
  waiverAcknowledged: false,
}

interface WalkInFormProps {
  waiverVersion: string | null
  submitting: boolean
  onSubmit: (values: WalkInFormValues) => Promise<void>
}

const inputClass =
  'w-full rounded-2xl border-2 border-karma-tan-dark/40 bg-white px-4 py-3 text-lg text-karma-ink placeholder:text-karma-ink-soft focus:border-karma-red'

/** Records attendance for someone who isn't a Karma member at all — not a member account. */
export function WalkInForm({ waiverVersion, submitting, onSubmit }: WalkInFormProps) {
  const { t } = useTranslation('scanner')
  const [values, setValues] = useState<WalkInFormValues>(emptyValues)
  const [error, setError] = useState<string | null>(null)
  const [justSubmitted, setJustSubmitted] = useState(false)

  const set = <K extends keyof WalkInFormValues>(key: K, value: WalkInFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setJustSubmitted(false)

    if (!values.fullName.trim()) {
      setError(t('walkIn.errors.nameRequired'))
      return
    }
    if (!values.confirmedAdult) {
      setError(t('walkIn.errors.adultRequired'))
      return
    }
    if (!values.waiverAcknowledged) {
      setError(t('walkIn.errors.waiverRequired'))
      return
    }
    if (!waiverVersion) {
      setError(t('walkIn.errors.noWaiverVersion'))
      return
    }

    await onSubmit(values)
    setValues(emptyValues)
    setJustSubmitted(true)
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      {justSubmitted && (
        <p className="rounded-2xl bg-green-50 px-4 py-3 font-semibold text-green-800">
          {t('walkIn.success')}
        </p>
      )}

      <label className="flex flex-col gap-1">
        <span className="font-display text-sm font-bold text-karma-ink">{t('walkIn.fields.fullName')} *</span>
        <input
          className={inputClass}
          value={values.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          autoComplete="name"
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-display text-sm font-bold text-karma-ink">{t('walkIn.fields.email')}</span>
        <input
          type="email"
          className={inputClass}
          value={values.email}
          onChange={(e) => set('email', e.target.value)}
          autoComplete="email"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-display text-sm font-bold text-karma-ink">{t('walkIn.fields.phone')}</span>
        <input
          type="tel"
          className={inputClass}
          value={values.phone}
          onChange={(e) => set('phone', e.target.value)}
          autoComplete="tel"
        />
      </label>

      <div className="mt-2 border-t border-karma-tan-dark/30 pt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-karma-ink-soft">
          {t('walkIn.sections.emergency')}
        </p>
        <div className="mt-3 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-display text-sm font-bold text-karma-ink">
              {t('walkIn.fields.emergencyContactName')}
            </span>
            <input
              className={inputClass}
              value={values.emergencyContactName}
              onChange={(e) => set('emergencyContactName', e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-display text-sm font-bold text-karma-ink">
              {t('walkIn.fields.emergencyContactPhone')}
            </span>
            <input
              type="tel"
              className={inputClass}
              value={values.emergencyContactPhone}
              onChange={(e) => set('emergencyContactPhone', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-3 border-t border-karma-tan-dark/30 pt-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-6 w-6 shrink-0 accent-karma-red"
            checked={values.confirmedAdult}
            onChange={(e) => set('confirmedAdult', e.target.checked)}
          />
          <span className="text-base font-semibold text-karma-ink">{t('walkIn.fields.confirmedAdult')}</span>
        </label>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-6 w-6 shrink-0 accent-karma-red"
            checked={values.waiverAcknowledged}
            onChange={(e) => set('waiverAcknowledged', e.target.checked)}
          />
          <span className="text-base font-semibold text-karma-ink">{t('walkIn.fields.waiverAcknowledged')}</span>
        </label>
      </div>

      {error && <p className="font-semibold text-karma-red">{error}</p>}

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={submitting}>
        {submitting ? t('walkIn.submitting') : t('walkIn.submitCta')}
      </Button>
    </form>
  )
}
