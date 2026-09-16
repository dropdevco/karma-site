import type { JoinFormValues } from './formTypes'

export interface JoinInterestPayload {
  fullName: string
  email: string
  phone: string
  preferredLanguage: string
  activities: string[]
  emergencyContact: { name: string; phone: string }
  dateOfBirth: string
  waiverAccepted: boolean
  photoConsent: boolean
  emailOptIn: boolean
  heardAbout: string
}

function toPayload(values: JoinFormValues): JoinInterestPayload {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    preferredLanguage: values.preferredLanguage,
    activities: values.activities,
    emergencyContact: {
      name: values.emergencyName.trim(),
      phone: values.emergencyPhone.trim(),
    },
    dateOfBirth: values.dateOfBirth,
    waiverAccepted: values.waiverAccepted,
    photoConsent: values.photoConsent,
    emailOptIn: values.emailOptIn,
    heardAbout: values.heardAbout,
  }
}

/**
 * RELEASE 2 SEAM: this is the only function that needs to change once the
 * membership backend exists. Swap the simulated delay below for a real call,
 * e.g.:
 *
 *   const res = await fetch('/api/join', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(toPayload(values)),
 *   })
 *   if (!res.ok) throw new Error('join request failed')
 *
 * JoinForm only depends on this resolving on success and throwing/rejecting
 * on failure, so the calling code needs no changes.
 */
export async function submitJoinRequest(values: JoinFormValues): Promise<void> {
  const payload = toPayload(values)
  await new Promise((resolve) => setTimeout(resolve, 1100))
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[join] simulated signup submission', payload)
  }
}
