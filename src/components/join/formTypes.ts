import type {
  ActivityKey,
  HeardAboutKey,
  LanguageCode,
  ProfileRow,
  ProfileUpdate,
} from '@/lib/database.types'

export type { ActivityKey, HeardAboutKey, LanguageCode }

export interface FieldOption<T extends string> {
  value: T
  label: string
}

export interface ProfileFormValues {
  fullName: string
  phone: string
  preferredLanguage: LanguageCode | ''
  activities: ActivityKey[]
  emergencyName: string
  emergencyPhone: string
  dateOfBirth: string
  photoConsent: boolean
  reminderOptIn: boolean
  heardAbout: HeardAboutKey | ''
}

export const emptyProfileFormValues: ProfileFormValues = {
  fullName: '',
  phone: '',
  preferredLanguage: '',
  activities: [],
  emergencyName: '',
  emergencyPhone: '',
  dateOfBirth: '',
  photoConsent: false,
  reminderOptIn: false,
  heardAbout: '',
}

export function profileToFormValues(profile: ProfileRow | null): ProfileFormValues {
  if (!profile) return emptyProfileFormValues
  return {
    fullName: profile.full_name ?? '',
    phone: profile.phone ?? '',
    preferredLanguage: profile.preferred_language ?? '',
    activities: profile.activities ?? [],
    emergencyName: profile.emergency_contact_name ?? '',
    emergencyPhone: profile.emergency_contact_phone ?? '',
    dateOfBirth: profile.date_of_birth ?? '',
    photoConsent: profile.photo_consent ?? false,
    reminderOptIn: profile.reminder_opt_in ?? false,
    heardAbout: profile.heard_about ?? '',
  }
}

export function formValuesToPatch(values: ProfileFormValues): ProfileUpdate {
  return {
    full_name: values.fullName.trim(),
    phone: values.phone.trim(),
    preferred_language: values.preferredLanguage as LanguageCode,
    activities: values.activities,
    emergency_contact_name: values.emergencyName.trim(),
    emergency_contact_phone: values.emergencyPhone.trim(),
    date_of_birth: values.dateOfBirth,
    photo_consent: values.photoConsent,
    reminder_opt_in: values.reminderOptIn,
    heard_about: values.heardAbout === '' ? null : values.heardAbout,
  }
}

// Fields that participate in required-field validation, in visual/tab order.
// Used to find the first invalid field to focus after a failed submit.
export const PROFILE_FIELD_ORDER = [
  'fullName',
  'phone',
  'preferredLanguage',
  'activities',
  'emergencyName',
  'emergencyPhone',
  'dateOfBirth',
] as const

export type ProfileFormField = (typeof PROFILE_FIELD_ORDER)[number]

export type ProfileFormErrors = Partial<Record<ProfileFormField, string>>
