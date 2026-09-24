import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { useAuth } from '@/auth/useAuth'
import { EmailOtpFlow } from '@/components/auth/EmailOtpFlow'
import { PasswordSignInForm } from '@/components/auth/PasswordSignInForm'

type Mode = 'password' | 'code'

interface SignInLocationState {
  returnTo?: string
}

export function SignIn() {
  const { t } = useTranslation('auth')
  const { loading, session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as SignInLocationState | null
  const returnTo = state?.returnTo || '/account'
  const [mode, setMode] = useState<Mode>('password')

  useEffect(() => {
    if (!loading && session) {
      navigate(returnTo, { replace: true })
    }
  }, [loading, session, navigate, returnTo])

  return (
    <Section>
      <Container className="max-w-md">
        <div className="rounded-card border border-karma-tan-dark/30 bg-white p-6 shadow-sm sm:p-10">
          <Eyebrow>{t('signIn.eyebrow')}</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold text-karma-ink sm:text-4xl">{t('signIn.heading')}</h1>
          <p className="mt-2 text-karma-ink-soft">{t('signIn.subhead')}</p>
          <div className="mt-8">
            {mode === 'password' ? (
              <PasswordSignInForm onSignedIn={() => navigate(returnTo, { replace: true })} />
            ) : (
              <EmailOtpFlow onVerified={() => navigate(returnTo, { replace: true })} />
            )}
          </div>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setMode((current) => (current === 'password' ? 'code' : 'password'))}
              className="min-h-11 font-display text-sm font-semibold text-karma-red underline-offset-2 hover:underline"
            >
              {mode === 'password' ? t('signIn.useCodeInstead') : t('signIn.usePasswordInstead')}
            </button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
