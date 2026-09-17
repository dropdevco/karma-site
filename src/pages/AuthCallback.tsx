import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Section, Container } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { useAuth } from '@/auth/useAuth'

const TIMEOUT_MS = 6000

export function AuthCallback() {
  const { t } = useTranslation('auth')
  const { loading, session } = useAuth()
  const navigate = useNavigate()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!loading && session) {
      navigate('/account', { replace: true })
    }
  }, [loading, session, navigate])

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [])

  const failed = timedOut && !loading && !session

  return (
    <Section>
      <Container className="max-w-md text-center">
        {failed ? (
          <>
            <h1 className="text-2xl font-bold text-karma-ink">{t('callback.errorHeading')}</h1>
            <p className="mt-2 text-karma-ink-soft">{t('callback.errorBody')}</p>
            <ButtonLink to="/signin" size="lg" className="mt-6 inline-flex">
              {t('callback.backToSignIn')}
            </ButtonLink>
          </>
        ) : (
          <p className="text-karma-ink-soft" aria-busy="true" role="status">
            {t('callback.heading')}
          </p>
        )}
      </Container>
    </Section>
  )
}
