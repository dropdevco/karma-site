import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/join/TextField'
import { supabase } from '@/lib/supabase'
import { classifyResetRequestError, classifyThrownPasswordError, type ResetRequestErrorCode } from '@/components/auth/passwordErrors'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPassword() {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorCode, setErrorCode] = useState<ResetRequestErrorCode | null>(null)
  const [sent, setSent] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const localError = !email.trim()
    ? t('errors.emailRequired')
    : !EMAIL_RE.test(email.trim())
      ? t('errors.emailInvalid')
      : undefined
  const error = touched ? localError : errorCode ? t(`forgotPassword.errors.${errorCode}`) : undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    setErrorCode(null)

    if (localError) {
      inputRef.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) {
        setErrorCode(classifyResetRequestError(resetError))
        inputRef.current?.focus()
        return
      }
      setSent(true)
    } catch (err) {
      setErrorCode(classifyThrownPasswordError(err))
      inputRef.current?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Section>
      <Container className="max-w-md">
        <div className="rounded-card border border-karma-tan-dark/30 bg-white p-6 shadow-sm sm:p-10">
          <Eyebrow>{t('forgotPassword.eyebrow')}</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold text-karma-ink sm:text-4xl">{t('forgotPassword.heading')}</h1>
          <p className="mt-2 text-karma-ink-soft">{t('forgotPassword.subhead')}</p>

          {sent ? (
            <p role="status" className="mt-8 rounded-xl border border-karma-tan-dark/40 bg-karma-tan-light/60 px-4 py-3 text-sm text-karma-ink">
              {t('forgotPassword.sent')}
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-6">
              <div aria-live="polite" role="status" className="sr-only">
                {error ?? ''}
              </div>
              <TextField
                id="forgot-password-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                label={t('emailStep.label')}
                placeholder={t('emailStep.placeholder')}
                required
                value={email}
                error={error}
                onChange={setEmail}
                onBlur={() => setTouched(true)}
                ref={inputRef}
              />
              <Button type="submit" size="lg" disabled={submitting} className="w-full">
                {submitting ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/signin"
              className="min-h-11 font-display text-sm font-semibold text-karma-red underline-offset-2 hover:underline"
            >
              {t('forgotPassword.backToSignIn')}
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  )
}
