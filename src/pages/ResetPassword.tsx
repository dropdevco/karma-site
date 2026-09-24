import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { Button, ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { supabase } from '@/lib/supabase'
import { MIN_PASSWORD_LENGTH, validateNewPassword } from '@/components/auth/passwordValidation'
import {
  classifyPasswordUpdateError,
  classifyThrownPasswordError,
  type PasswordUpdateErrorCode,
} from '@/components/auth/passwordErrors'

const RECOVERY_WAIT_MS = 5000

function Waiting() {
  return <div className="min-h-[40vh]" aria-busy="true" />
}

export function ResetPassword() {
  const { t } = useTranslation('auth')
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorCode, setErrorCode] = useState<PasswordUpdateErrorCode | null>(null)
  const [done, setDone] = useState(false)
  const passwordRef = useRef<HTMLInputElement | null>(null)
  const confirmRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let cancelled = false
    let settled = false

    function settle(found: boolean) {
      if (settled || cancelled) return
      settled = true
      setHasSession(found)
      setChecking(false)
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        settle(true)
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) settle(true)
    })

    const timeout = setTimeout(() => settle(false), RECOVERY_WAIT_MS)

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const validationError = touched ? validateNewPassword(password, confirmPassword) : null
  const localError = validationError
    ? t(`resetPassword.errors.${validationError}`, { count: MIN_PASSWORD_LENGTH })
    : undefined
  const serverError = errorCode ? t(`resetPassword.errors.${errorCode}`) : undefined
  const error = serverError ?? localError
  const errorId = error ? 'reset-password-error' : undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    setErrorCode(null)

    const validation = validateNewPassword(password, confirmPassword)
    if (validation) {
      ;(validation === 'tooShort' ? passwordRef : confirmRef).current?.focus()
      return
    }

    setSubmitting(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setErrorCode(classifyPasswordUpdateError(updateError))
        passwordRef.current?.focus()
        return
      }
      setDone(true)
    } catch (err) {
      setErrorCode(classifyThrownPasswordError(err))
      passwordRef.current?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Section>
      <Container className="max-w-md">
        <div className="rounded-card border border-karma-tan-dark/30 bg-white p-6 shadow-sm sm:p-10">
          {checking && <Waiting />}

          {!checking && !hasSession && (
            <>
              <Eyebrow>{t('resetPassword.eyebrow')}</Eyebrow>
              <h1 className="mt-3 text-3xl font-bold text-karma-ink sm:text-4xl">
                {t('resetPassword.expiredHeading')}
              </h1>
              <p className="mt-2 text-karma-ink-soft">{t('resetPassword.expiredBody')}</p>
              <div className="mt-8">
                <ButtonLink to="/forgot-password" size="lg" className="w-full">
                  {t('resetPassword.requestNew')}
                </ButtonLink>
              </div>
            </>
          )}

          {!checking && hasSession && done && (
            <div role="status">
              <Eyebrow>{t('resetPassword.eyebrow')}</Eyebrow>
              <h1 className="mt-3 text-3xl font-bold text-karma-ink sm:text-4xl">{t('resetPassword.doneHeading')}</h1>
              <p className="mt-2 text-karma-ink-soft">{t('resetPassword.doneBody')}</p>
              <div className="mt-8">
                <ButtonLink to="/account" size="lg" className="w-full">
                  {t('resetPassword.doneCta')}
                </ButtonLink>
              </div>
            </div>
          )}

          {!checking && hasSession && !done && (
            <>
              <Eyebrow>{t('resetPassword.eyebrow')}</Eyebrow>
              <h1 className="mt-3 text-3xl font-bold text-karma-ink sm:text-4xl">{t('resetPassword.heading')}</h1>
              <p className="mt-2 text-karma-ink-soft">{t('resetPassword.subhead')}</p>

              <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-6">
                <div aria-live="polite" role="status" className="sr-only">
                  {error ?? ''}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reset-new-password" className="font-display text-sm font-semibold text-karma-ink">
                    {t('resetPassword.newLabel')}
                    <span className="text-karma-red" aria-hidden="true">
                      {' '}
                      *
                    </span>
                  </label>
                  <input
                    ref={passwordRef}
                    id="reset-new-password"
                    name="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={errorId}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={cn(
                      'min-h-11 rounded-xl border border-karma-tan-dark/40 bg-white px-4 py-2.5 text-base text-karma-ink focus:border-karma-red',
                      error && 'border-karma-red',
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reset-confirm-password" className="font-display text-sm font-semibold text-karma-ink">
                    {t('resetPassword.confirmLabel')}
                    <span className="text-karma-red" aria-hidden="true">
                      {' '}
                      *
                    </span>
                  </label>
                  <input
                    ref={confirmRef}
                    id="reset-confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={errorId}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={cn(
                      'min-h-11 rounded-xl border border-karma-tan-dark/40 bg-white px-4 py-2.5 text-base text-karma-ink focus:border-karma-red',
                      error && 'border-karma-red',
                    )}
                  />
                  {error && (
                    <p id={errorId} className="text-sm font-medium text-karma-red">
                      {error}
                    </p>
                  )}
                </div>

                <Button type="submit" size="lg" disabled={submitting} className="w-full">
                  {submitting ? t('resetPassword.submitting') : t('resetPassword.submit')}
                </Button>
              </form>
            </>
          )}

          {!checking && !done && (
            <div className="mt-6 text-center">
              <Link
                to="/signin"
                className="min-h-11 font-display text-sm font-semibold text-karma-red underline-offset-2 hover:underline"
              >
                {t('resetPassword.backToSignIn')}
              </Link>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
