import type { EventCategory } from '@/lib/database.types'

export interface EventFormValues {
  slug: string
  title_en: string
  title_es: string
  description_en: string
  description_es: string
  category: EventCategory | ''
  starts_at: string
  ends_at: string
  venue_name: string
  venue_address: string
  capacity: string
  donation_item_en: string
  donation_item_es: string
  donation_suggestion_en: string
  donation_suggestion_es: string
  beneficiary_en: string
  beneficiary_es: string
  recurring: boolean
}

export const EVENT_FORM_FIELD_ORDER = [
  'title_en',
  'title_es',
  'slug',
  'category',
  'starts_at',
  'ends_at',
  'venue_name',
  'venue_address',
  'capacity',
  'description_en',
  'description_es',
  'donation_item_en',
  'donation_item_es',
  'donation_suggestion_en',
  'donation_suggestion_es',
  'beneficiary_en',
  'beneficiary_es',
] as const satisfies readonly (keyof EventFormValues)[]

export type EventFormField = (typeof EVENT_FORM_FIELD_ORDER)[number]

export type EventFormErrors = Partial<Record<EventFormField, string>>

export const initialEventFormValues: EventFormValues = {
  slug: '',
  title_en: '',
  title_es: '',
  description_en: '',
  description_es: '',
  category: '',
  starts_at: '',
  ends_at: '',
  venue_name: '',
  venue_address: '',
  capacity: '20',
  donation_item_en: '',
  donation_item_es: '',
  donation_suggestion_en: '',
  donation_suggestion_es: '',
  beneficiary_en: '',
  beneficiary_es: '',
  recurring: false,
}
