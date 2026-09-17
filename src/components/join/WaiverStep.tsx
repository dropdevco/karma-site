import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { WaiverPanel } from './WaiverPanel'

interface WaiverStepProps {
  onAccept: () => Promise<void>
  submitLabel?: string
  submittingLabel?: string
  errorMessage: string
}

export function WaiverStep({ onAccept, submitLabel, submittingLabel, errorMessage }: WaiverStepProps) {
  const { t } = useTranslation('join')
  const [checked, setChecked] = useState(false)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [failed, setFailed] = useState(false)

  const paragraphs = [t('waiver.body1'), t('waiver.body2'), t('waiver.body3'), t('waiver.body4')]
  const error = touched && !checked ? t('waiver.error') : undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (!checked) return

    setSubmitting(true)
    setFailed(false)
    try {
      await onAccept()
    } catch {
      setFailed(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div aria-live="polite" role="status" className="sr-only">
        {error ?? ''}
      </div>

      {failed && (
        <div
          role="alert"
          className="rounded-xl border border-karma-red/40 bg-karma-red-soft px-4 py-3 text-sm font-medium text-karma-red-dark"
        >
          {errorMessage}
        </div>
      )}

      <WaiverPanel
        legend={t('waiver.legend')}
        paragraphs={paragraphs}
        checkboxLabel={t('waiver.checkboxLabel')}
        checked={checked}
        error={error}
        onChange={setChecked}
        onBlur={() => setTouched(true)}
      />

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? (submittingLabel ?? t('waiver.submitting')) : (submitLabel ?? t('waiver.submit'))}
      </Button>
    </form>
  )
}
