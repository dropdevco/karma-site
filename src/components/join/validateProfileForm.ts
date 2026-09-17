import type { ProfileFormErrors, ProfileFormValues } from './formTypes'

type Translate = (key: string, options?: Record<string, unknown>) => string

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

function isAdult(dob: string): boolean {
  const dobDate = new Date(dob)
  if (Number.isNaN(dobDate.getTime())) return false

  const today = new Date()
  let age = today.getFullYear() - dobDate.getFullYear()
  const monthDiff = today.getMonth() - dobDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
    age -= 1
  }
  return age >= 18
}

export function validateProfileForm(values: ProfileFormValues, t: Translate): ProfileFormErrors {
  const errors: ProfileFormErrors = {}

  if (!values.fullName.trim()) {
    errors.fullName = t('profile.errors.fullNameRequired')
  }

  if (!values.phone.trim()) {
    errors.phone = t('profile.errors.phoneRequired')
  } else if (!isValidPhone(values.phone)) {
    errors.phone = t('profile.errors.phoneInvalid')
  }

  if (!values.preferredLanguage) {
    errors.preferredLanguage = t('profile.errors.preferredLanguageRequired')
  }

  if (values.activities.length === 0) {
    errors.activities = t('profile.errors.activitiesRequired')
  }

  if (!values.emergencyName.trim()) {
    errors.emergencyName = t('profile.errors.emergencyNameRequired')
  }

  if (!values.emergencyPhone.trim()) {
    errors.emergencyPhone = t('profile.errors.emergencyPhoneRequired')
  } else if (!isValidPhone(values.emergencyPhone)) {
    errors.emergencyPhone = t('profile.errors.emergencyPhoneInvalid')
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = t('profile.errors.dateOfBirthRequired')
  } else if (Number.isNaN(new Date(values.dateOfBirth).getTime())) {
    errors.dateOfBirth = t('profile.errors.dateOfBirthInvalid')
  } else if (!isAdult(values.dateOfBirth)) {
    errors.dateOfBirth = t('profile.errors.dateOfBirthUnder18')
  }

  return errors
}
