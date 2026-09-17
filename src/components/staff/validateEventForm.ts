import { dateTimeLocalToIso } from './dateTime'
import { isValidSlug } from './slug'
import type { EventFormErrors, EventFormValues } from './eventFormTypes'

type Translate = (key: string, options?: Record<string, unknown>) => string

export function validateEventForm(values: EventFormValues, t: Translate): EventFormErrors {
  const errors: EventFormErrors = {}

  if (!values.title_en.trim()) errors.title_en = t('form.errors.required')
  if (!values.title_es.trim()) errors.title_es = t('form.errors.required')

  if (!values.slug.trim()) {
    errors.slug = t('form.errors.slugRequired')
  } else if (!isValidSlug(values.slug.trim())) {
    errors.slug = t('form.errors.slugFormat')
  }

  if (!values.category) errors.category = t('form.errors.required')

  const startIso = dateTimeLocalToIso(values.starts_at)
  const endIso = dateTimeLocalToIso(values.ends_at)

  if (!values.starts_at) {
    errors.starts_at = t('form.errors.required')
  } else if (!startIso) {
    errors.starts_at = t('form.errors.dateInvalid')
  }

  if (!values.ends_at) {
    errors.ends_at = t('form.errors.required')
  } else if (!endIso) {
    errors.ends_at = t('form.errors.dateInvalid')
  } else if (startIso && endIso && endIso <= startIso) {
    errors.ends_at = t('form.errors.endBeforeStart')
  }

  if (!values.venue_name.trim()) errors.venue_name = t('form.errors.required')
  if (!values.venue_address.trim()) errors.venue_address = t('form.errors.required')

  const capacityNumber = Number(values.capacity)
  if (!values.capacity.trim()) {
    errors.capacity = t('form.errors.required')
  } else if (!Number.isInteger(capacityNumber) || capacityNumber < 1 || capacityNumber > 10000) {
    errors.capacity = t('form.errors.capacityRange')
  }

  if (!values.description_en.trim()) errors.description_en = t('form.errors.required')
  if (!values.description_es.trim()) errors.description_es = t('form.errors.required')

  if (!values.donation_item_en.trim()) errors.donation_item_en = t('form.errors.required')
  if (!values.donation_item_es.trim()) errors.donation_item_es = t('form.errors.required')

  if (!values.donation_suggestion_en.trim()) errors.donation_suggestion_en = t('form.errors.required')
  if (!values.donation_suggestion_es.trim()) errors.donation_suggestion_es = t('form.errors.required')

  if (!values.beneficiary_en.trim()) errors.beneficiary_en = t('form.errors.required')
  if (!values.beneficiary_es.trim()) errors.beneficiary_es = t('form.errors.required')

  return errors
}
