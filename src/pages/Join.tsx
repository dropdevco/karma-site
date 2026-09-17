import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Section, Container } from '@/components/ui/Section'
import { useAuth } from '@/auth/useAuth'
import type { ProfileUpdate } from '@/lib/database.types'
import { EmailOtpFlow } from '@/components/auth/EmailOtpFlow'
import { WhyJoinSection } from '@/components/join/WhyJoinSection'
import { ProfileForm } from '@/components/join/ProfileForm'
import { WaiverStep } from '@/components/join/WaiverStep'
import { SuccessPanel } from '@/components/join/SuccessPanel'
import { profileToFormValues } from '@/components/join/formTypes'
import { acceptCurrentWaiver, getMyAccountStatus, updateMyProfile } from '@/components/join/accountApi'

type Step = 'email' | 'profile' | 'waiver' | 'success'

function Waiting() {
  return <div className="min-h-[40vh]" aria-busy="true" />
}

export function Join() {
  const { t } = useTranslation('join')
  const { loading, session, user, profile, status, refresh } = useAuth()
  const [step, setStep] = useState<Step | null>(null)

  // Someone who lands on /join already signed in should skip straight to
  // whichever step is unfinished, rather than being asked to sign in again.
  useEffect(() => {
    if (step !== null || loading) return
    if (!session) {
      setStep('email')
      return
    }
    if (!status) return
    if (!status.profile_complete) {
      setStep('profile')
    } else if (!status.waiver_current) {
      setStep('waiver')
    } else {
      setStep('success')
    }
  }, [step, loading, session, status])

  async function handleProfileSave(patch: ProfileUpdate) {
    if (!user) throw new Error('not_authenticated')
    await updateMyProfile(user.id, patch)
  }

  async function handleProfileSaved() {
    const freshStatus = await getMyAccountStatus()
    await refresh()
    setStep(freshStatus?.waiver_current ? 'success' : 'waiver')
  }

  async function handleWaiverAccept() {
    await acceptCurrentWaiver()
    await refresh()
    setStep('success')
  }

  return (
    <>
      <WhyJoinSection />
      <Section className="pt-0">
        <Container className="max-w-3xl">
          <div className="rounded-card border border-karma-tan-dark/30 bg-white p-6 shadow-sm sm:p-10">
            {step === null && <Waiting />}

            {step === 'email' && (
              <>
                <h2 className="text-2xl font-bold text-karma-ink sm:text-3xl">{t('emailStep.heading')}</h2>
                <p className="mt-2 text-karma-ink-soft">{t('emailStep.intro')}</p>
                <div className="mt-8">
                  <EmailOtpFlow onVerified={() => setStep('profile')} />
                </div>
              </>
            )}

            {step === 'profile' && (
              <>
                <h2 className="text-2xl font-bold text-karma-ink sm:text-3xl">{t('profile.heading')}</h2>
                <p className="mt-2 text-karma-ink-soft">{t('profile.intro')}</p>
                <div className="mt-8">
                  <ProfileForm
                    initialValues={profileToFormValues(profile)}
                    submitLabel={t('profile.submit')}
                    submittingLabel={t('profile.submitting')}
                    savedMessage={t('profile.saved')}
                    errorMessage={t('profile.submitError')}
                    offlineMessage={t('profile.submitErrorOffline')}
                    onSave={handleProfileSave}
                    onSaved={() => {
                      void handleProfileSaved()
                    }}
                  />
                </div>
              </>
            )}

            {step === 'waiver' && (
              <>
                <h2 className="text-2xl font-bold text-karma-ink sm:text-3xl">{t('waiver.heading')}</h2>
                <p className="mt-2 text-karma-ink-soft">{t('waiver.intro')}</p>
                <div className="mt-8">
                  <WaiverStep onAccept={handleWaiverAccept} errorMessage={t('waiver.submitError')} />
                </div>
              </>
            )}

            {step === 'success' && <SuccessPanel name={profile?.full_name} />}
          </div>
        </Container>
      </Section>
    </>
  )
}
