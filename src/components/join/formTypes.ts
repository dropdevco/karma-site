export type LanguageCode = 'en' | 'es'
export type ActivityKey = 'soccer' | 'basketball' | 'running' | 'other'
export type HeardAboutKey = 'friend' | 'event' | 'social' | 'search' | 'other'

export interface FieldOption<T extends string> {
  value: T
  label: string
}

export interface JoinFormValues {
  fullName: string
  email: string
  phone: string
  preferredLanguage: LanguageCode | ''
  activities: ActivityKey[]
  emergencyName: string
  emergencyPhone: string
  dateOfBirth: string
  waiverAccepted: boolean
  photoConsent: boolean
  emailOptIn: boolean
  heardAbout: HeardAboutKey | ''
}

export const initialJoinFormValues: JoinFormValues = {
  fullName: '',
  email: '',
  phone: '',
  preferredLanguage: '',
  activities: [],
  emergencyName: '',
  emergencyPhone: '',
  dateOfBirth: '',
  waiverAccepted: false,
  photoConsent: false,
  emailOptIn: false,
  heardAbout: '',
}

// Fields that participate in required-field validation, in visual/tab order.
// Used to find the first invalid field to focus after a failed submit.
export const JOIN_FORM_FIELD_ORDER = [
  'fullName',
  'email',
  'phone',
  'preferredLanguage',
  'activities',
  'emergencyName',
  'emergencyPhone',
  'dateOfBirth',
  'waiverAccepted',
] as const

export type JoinFormField = (typeof JOIN_FORM_FIELD_ORDER)[number]

export type JoinFormErrors = Partial<Record<JoinFormField, string>>
