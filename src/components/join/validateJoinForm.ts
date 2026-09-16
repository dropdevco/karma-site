import type { JoinFormErrors, JoinFormValues } from './formTypes'

type Translate = (key: string, options?: Record<string, unknown>) => string

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

export function validateJoinForm(values: JoinFormValues, t: Translate): JoinFormErrors {
  const errors: JoinFormErrors = {}

  if (!values.fullName.trim()) {
    errors.fullName = t('form.errors.fullNameRequired')
  }

  if (!values.email.trim()) {
    errors.email = t('form.errors.emailRequired')
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = t('form.errors.emailInvalid')
  }

  if (!values.phone.trim()) {
    errors.phone = t('form.errors.phoneRequired')
  } else if (!isValidPhone(values.phone)) {
    errors.phone = t('form.errors.phoneInvalid')
  }

  if (!values.preferredLanguage) {
    errors.preferredLanguage = t('form.errors.preferredLanguageRequired')
  }

  if (values.activities.length === 0) {
    errors.activities = t('form.errors.activitiesRequired')
  }

  if (!values.emergencyName.trim()) {
    errors.emergencyName = t('form.errors.emergencyNameRequired')
  }

  if (!values.emergencyPhone.trim()) {
    errors.emergencyPhone = t('form.errors.emergencyPhoneRequired')
  } else if (!isValidPhone(values.emergencyPhone)) {
    errors.emergencyPhone = t('form.errors.emergencyPhoneInvalid')
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = t('form.errors.dateOfBirthRequired')
  } else if (Number.isNaN(new Date(values.dateOfBirth).getTime())) {
    errors.dateOfBirth = t('form.errors.dateOfBirthInvalid')
  } else if (!isAdult(values.dateOfBirth)) {
    errors.dateOfBirth = t('form.errors.dateOfBirthUnder18')
  }

  if (!values.waiverAccepted) {
    errors.waiverAccepted = t('form.errors.waiverRequired')
  }

  return errors
}
