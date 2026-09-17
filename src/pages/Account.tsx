import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { useAuth } from '@/auth/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import type { ActivityKey, HeardAboutKey, ProfileUpdate } from '@/lib/database.types'
import { ProfileForm } from '@/components/join/ProfileForm'
import { WaiverStep } from '@/components/join/WaiverStep'
import { profileToFormValues } from '@/components/join/formTypes'
import { acceptCurrentWaiver, updateMyProfile } from '@/components/join/accountApi'

function Waiting() {
  return <div className="min-h-[50vh]" aria-busy="true" />
}

function formatDate(value: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(value))
  } catch {
    return value
  }
}

export function Account() {
  const { t } = useTranslation('auth')
  const { t: tJoin } = useTranslation('join')
  const language = useLanguage()
  const navigate = useNavigate()
  const { loading, user, profile, status, stale, refresh, signOut } = useAuth()
  const [editing, setEditing] = useState(false)

  if (loading || !user || !profile || !status) return <Waiting />

  const currentUser = user

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  async function handleProfileSave(patch: ProfileUpdate) {
    await updateMyProfile(currentUser.id, patch)
  }

  async function handleWaiverAccept() {
    await acceptCurrentWaiver()
    await refresh()
  }

  const activityLabels = profile.activities.map((activity: ActivityKey) =>
    tJoin(`profile.fields.activities.options.${activity}`),
  )
  const heardAboutLabel = profile.heard_about
    ? tJoin(`profile.fields.heardAbout.options.${profile.heard_about as HeardAboutKey}`)
    : null
  const yesNo = (value: boolean) => (value ? t('account.profile.yes') : t('account.profile.no'))

  return (
    <Section>
      <Container className="max-w-3xl">
        <Eyebrow>{t('account.eyebrow')}</Eyebrow>
        <h1 className="mt-3 text-3xl font-bold text-karma-ink sm:text-4xl">
          {t('account.heading', { name: profile.full_name || user.email })}
        </h1>

        {stale && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-karma-tan-dark/40 bg-karma-tan-light/60 px-4 py-3 text-sm text-karma-ink-soft"
          >
            {t('account.staleNotice')}
          </p>
        )}

        <div className="mt-8 rounded-card border border-karma-tan-dark/30 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-karma-ink">{t('account.profile.heading')}</h2>
            <Button variant="secondary" size="sm" onClick={() => setEditing((value) => !value)}>
              {editing ? t('account.profile.cancel') : t('account.profile.edit')}
            </Button>
          </div>

          {editing ? (
            <div className="mt-6">
              <ProfileForm
                initialValues={profileToFormValues(profile)}
                submitLabel={t('account.profile.save')}
                submittingLabel={t('account.profile.saving')}
                savedMessage={t('account.profile.saved')}
                errorMessage={t('account.profile.saveError')}
                offlineMessage={t('account.profile.saveErrorOffline')}
                onSave={handleProfileSave}
                onSaved={() => {
                  void refresh()
                }}
              />
            </div>
          ) : (
            <dl className="mt-6 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-display font-semibold text-karma-ink">
                  {tJoin('profile.fields.fullName.label')}
                </dt>
                <dd className="mt-1 text-karma-ink-soft">{profile.full_name || '—'}</dd>
              </div>
              <div>
                <dt className="font-display font-semibold text-karma-ink">
                  {tJoin('profile.fields.phone.label')}
                </dt>
                <dd className="mt-1 text-karma-ink-soft">{profile.phone || '—'}</dd>
              </div>
              <div>
                <dt className="font-display font-semibold text-karma-ink">
                  {tJoin('profile.fields.preferredLanguage.legend')}
                </dt>
                <dd className="mt-1 text-karma-ink-soft">
                  {tJoin(`profile.fields.preferredLanguage.options.${profile.preferred_language}`)}
                </dd>
              </div>
              <div>
                <dt className="font-display font-semibold text-karma-ink">
                  {tJoin('profile.fields.activities.legend')}
                </dt>
                <dd className="mt-1 text-karma-ink-soft">
                  {activityLabels.length ? activityLabels.join(', ') : '—'}
                </dd>
              </div>
              <div>
                <dt className="font-display font-semibold text-karma-ink">
                  {tJoin('profile.fields.emergencyName.label')}
                </dt>
                <dd className="mt-1 text-karma-ink-soft">{profile.emergency_contact_name || '—'}</dd>
              </div>
              <div>
                <dt className="font-display font-semibold text-karma-ink">
                  {tJoin('profile.fields.emergencyPhone.label')}
                </dt>
                <dd className="mt-1 text-karma-ink-soft">{profile.emergency_contact_phone || '—'}</dd>
              </div>
              <div>
                <dt className="font-display font-semibold text-karma-ink">
                  {tJoin('profile.fields.dateOfBirth.label')}
                </dt>
                <dd className="mt-1 text-karma-ink-soft">
                  {profile.date_of_birth ? formatDate(profile.date_of_birth, language) : '—'}
                </dd>
              </div>
              <div>
                <dt className="font-display font-semibold text-karma-ink">
                  {tJoin('profile.fields.photoConsent.label')}
                </dt>
                <dd className="mt-1 text-karma-ink-soft">{yesNo(profile.photo_consent)}</dd>
              </div>
              <div>
                <dt className="font-display font-semibold text-karma-ink">
                  {tJoin('profile.fields.reminderOptIn.label')}
                </dt>
                <dd className="mt-1 text-karma-ink-soft">{yesNo(profile.reminder_opt_in)}</dd>
              </div>
              {heardAboutLabel && (
                <div>
                  <dt className="font-display font-semibold text-karma-ink">
                    {tJoin('profile.fields.heardAbout.label')}
                  </dt>
                  <dd className="mt-1 text-karma-ink-soft">{heardAboutLabel}</dd>
                </div>
              )}
            </dl>
          )}
        </div>

        <div className="mt-8 rounded-card border border-karma-tan-dark/30 bg-white p-6 shadow-sm sm:p-10">
          <h2 className="text-xl font-bold text-karma-ink">{t('account.waiver.heading')}</h2>
          {status.waiver_current ? (
            <p className="mt-2 text-sm text-karma-ink-soft">
              {t('account.waiver.current', { version: status.waiver_version })}
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm font-medium text-karma-red-dark">
                {t('account.waiver.outdated', { version: status.waiver_version })}
              </p>
              <div className="mt-6">
                <WaiverStep
                  onAccept={handleWaiverAccept}
                  submitLabel={t('account.waiver.accept')}
                  submittingLabel={t('account.waiver.accepting')}
                  errorMessage={t('account.waiver.acceptError')}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <ButtonLink to="/account/qr" variant="secondary" size="lg">
            {t('account.links.qr')}
          </ButtonLink>
          <ButtonLink to="/account/events" variant="secondary" size="lg">
            {t('account.links.events')}
          </ButtonLink>
          {(status.role === 'staff' || status.role === 'admin') && (
            <ButtonLink to="/staff" variant="secondary" size="lg">
              {t('account.links.staff')}
            </ButtonLink>
          )}
        </div>

        <div className="mt-8">
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              void handleSignOut()
            }}
          >
            {t('account.signOut')}
          </Button>
        </div>
      </Container>
    </Section>
  )
}
