import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { StaffTextField } from '@/components/staff/StaffTextField'
import { StaffTextArea } from '@/components/staff/StaffTextArea'
import { BilingualPair } from '@/components/staff/BilingualPair'
import type { DonationRow } from '@/lib/database.types'
import {
  DONATION_FORM_FIELD_ORDER,
  emptyDonationFormValues,
  validateDonationForm,
  type DonationFormErrors,
  type DonationFormField,
  type DonationFormValues,
} from './validateDonationForm'
import { createDonation, updateDonation } from './submitDonationForm'

type Mode = 'create' | 'edit'
type SubmitErrorReason = 'offline' | 'permission' | 'unknown'

interface DonationFormProps {
  mode: Mode
  idPrefix: string
  eventId: string
  donationId?: string
  initialValues?: DonationFormValues
  onSaved: (donation: DonationRow) => void
  onCancel?: () => void
}

export function valuesFromDonation(donation: DonationRow): DonationFormValues {
  return {
    description: donation.description,
    quantity: donation.quantity === null ? '' : String(donation.quantity),
    unit: donation.unit ?? '',
    beneficiary_en: donation.beneficiary_en ?? '',
    beneficiary_es: donation.beneficiary_es ?? '',
    notes: donation.notes ?? '',
  }
}

export function DonationForm({
  mode,
  idPrefix,
  eventId,
  donationId,
  initialValues,
  onSaved,
  onCancel,
}: DonationFormProps) {
  const { t } = useTranslation('staffDonations')

  const [values, setValues] = useState<DonationFormValues>(initialValues ?? emptyDonationFormValues)
  const [errors, setErrors] = useState<DonationFormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<DonationFormField, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitErrorReason, setSubmitErrorReason] = useState<SubmitErrorReason | null>(null)
  const [savedAnnouncement, setSavedAnnouncement] = useState('')

  const descriptionRef = useRef<HTMLInputElement | null>(null)
  const quantityRef = useRef<HTMLInputElement | null>(null)

  function updateValue<K extends DonationFormField>(field: K, value: DonationFormValues[K]) {
    setValues((prev) => {
      const next = { ...prev, [field]: value }
      setErrors(validateDonationForm(next, t))
      return next
    })
  }

  function handleBlur(field: DonationFormField) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function visibleError(field: DonationFormField): string | undefined {
    return touched[field] || submitAttempted ? errors[field] : undefined
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    setSubmitAttempted(true)
    const nextErrors = validateDonationForm(values, t)
    setErrors(nextErrors)

    const invalidFields = DONATION_FORM_FIELD_ORDER.filter((field) => nextErrors[field])
    if (invalidFields.length > 0) {
      if (invalidFields[0] === 'description') descriptionRef.current?.focus()
      else if (invalidFields[0] === 'quantity') quantityRef.current?.focus()
      return
    }

    setSubmitting(true)
    setSubmitErrorReason(null)

    const result =
      mode === 'edit' && donationId
        ? await updateDonation(donationId, values)
        : await createDonation(eventId, values)

    setSubmitting(false)

    if (!result.ok) {
      setSubmitErrorReason(result.reason)
      return
    }

    setSavedAnnouncement(t('form.savedConfirmation'))
    onSaved(result.donation)

    if (mode === 'create') {
      setValues(emptyDonationFormValues)
      setErrors({})
      setTouched({})
      setSubmitAttempted(false)
      descriptionRef.current?.focus()
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className="flex flex-col gap-5">
      <div aria-live="polite" role="status" className="sr-only">
        {savedAnnouncement}
      </div>

      <StaffTextField
        ref={descriptionRef}
        id={`${idPrefix}-description`}
        label={t('form.fields.description.label')}
        placeholder={t('form.fields.description.placeholder')}
        required
        value={values.description}
        onChange={(value) => updateValue('description', value)}
        onBlur={() => handleBlur('description')}
        error={visibleError('description')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StaffTextField
          ref={quantityRef}
          id={`${idPrefix}-quantity`}
          label={t('form.fields.quantity.label')}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={values.quantity}
          onChange={(value) => updateValue('quantity', value)}
          onBlur={() => handleBlur('quantity')}
          error={visibleError('quantity')}
        />
        <StaffTextField
          id={`${idPrefix}-unit`}
          label={t('form.fields.unit.label')}
          placeholder={t('form.fields.unit.placeholder')}
          value={values.unit}
          onChange={(value) => updateValue('unit', value)}
        />
      </div>

      <BilingualPair legend={t('form.fields.beneficiaryGroup')} hint={t('form.fields.beneficiaryHint')}>
        <StaffTextField
          id={`${idPrefix}-beneficiary-en`}
          label={t('form.fields.beneficiaryEn.label')}
          value={values.beneficiary_en}
          onChange={(value) => updateValue('beneficiary_en', value)}
        />
        <StaffTextField
          id={`${idPrefix}-beneficiary-es`}
          label={t('form.fields.beneficiaryEs.label')}
          value={values.beneficiary_es}
          onChange={(value) => updateValue('beneficiary_es', value)}
        />
      </BilingualPair>

      <StaffTextArea
        id={`${idPrefix}-notes`}
        label={t('form.fields.notes.label')}
        placeholder={t('form.fields.notes.placeholder')}
        rows={3}
        value={values.notes}
        onChange={(value) => updateValue('notes', value)}
      />

      {submitErrorReason && (
        <p role="alert" className="text-sm font-medium text-karma-red">
          {t(`form.errors.${submitErrorReason}`)}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" size="md" disabled={submitting}>
          {mode === 'edit'
            ? submitting
              ? t('form.savingChanges')
              : t('form.saveChanges')
            : submitting
              ? t('form.saving')
              : t('form.save')}
        </Button>
        {mode === 'edit' && (
          <Button type="button" variant="ghost" size="md" onClick={onCancel} disabled={submitting}>
            {t('form.cancel')}
          </Button>
        )}
      </div>
    </form>
  )
}
