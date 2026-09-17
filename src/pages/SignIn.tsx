import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { useAuth } from '@/auth/useAuth'
import { EmailOtpFlow } from '@/components/auth/EmailOtpFlow'

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
            <EmailOtpFlow onVerified={() => navigate(returnTo, { replace: true })} />
          </div>
        </div>
      </Container>
    </Section>
  )
}
