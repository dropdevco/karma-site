export type DonationFormValues = {
  description: string
  quantity: string
  unit: string
  beneficiary_en: string
  beneficiary_es: string
  notes: string
}

export type DonationFormField = keyof DonationFormValues

export const DONATION_FORM_FIELD_ORDER: DonationFormField[] = [
  'description',
  'quantity',
  'unit',
  'beneficiary_en',
  'beneficiary_es',
  'notes',
]

export type DonationFormErrors = Partial<Record<DonationFormField, string>>

export const emptyDonationFormValues: DonationFormValues = {
  description: '',
  quantity: '',
  unit: '',
  beneficiary_en: '',
  beneficiary_es: '',
  notes: '',
}

type Translate = (key: string, options?: Record<string, unknown>) => string

export function validateDonationForm(values: DonationFormValues, t: Translate): DonationFormErrors {
  const errors: DonationFormErrors = {}

  if (!values.description.trim()) {
    errors.description = t('form.errors.required')
  }

  if (values.quantity.trim()) {
    const quantity = Number(values.quantity)
    if (!Number.isFinite(quantity) || quantity < 0) {
      errors.quantity = t('form.errors.quantityInvalid')
    }
  }

  return errors
}
