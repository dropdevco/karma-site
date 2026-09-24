import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/join/TextField'
import { cn } from '@/lib/cn'
import { supabase } from '@/lib/supabase'
import { classifySignInError, classifyThrownPasswordError, type SignInErrorCode } from './passwordErrors'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface PasswordSignInFormProps {
  initialEmail?: string
  onSignedIn: () => void
}

export function PasswordSignInForm({ initialEmail = '', onSignedIn }: PasswordSignInFormProps) {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorCode, setErrorCode] = useState<SignInErrorCode | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  const emailLocalError = !email.trim()
    ? t('errors.emailRequired')
    : !EMAIL_RE.test(email.trim())
      ? t('errors.emailInvalid')
      : undefined
  const passwordLocalError = !password ? t('errors.passwordRequired') : undefined

  const emailError = touched ? emailLocalError : undefined
  const serverError = errorCode ? t(`signIn.password.errors.${errorCode}`) : undefined
  const passwordError = serverError ?? (touched ? passwordLocalError : undefined)
  const passwordErrorId = passwordError ? 'signin-password-error' : undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    setErrorCode(null)

    if (emailLocalError) {
      emailRef.current?.focus()
      return
    }
    if (passwordLocalError) {
      passwordRef.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) {
        setErrorCode(classifySignInError(error))
        passwordRef.current?.focus()
        return
      }
      onSignedIn()
    } catch (err) {
      setErrorCode(classifyThrownPasswordError(err))
      passwordRef.current?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div aria-live="polite" role="status" className="sr-only">
        {emailError ?? passwordError ?? ''}
      </div>

      <TextField
        id="signin-password-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        label={t('emailStep.label')}
        placeholder={t('emailStep.placeholder')}
        required
        value={email}
        error={emailError}
        onChange={setEmail}
        onBlur={() => setTouched(true)}
        ref={emailRef}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="signin-password" className="font-display text-sm font-semibold text-karma-ink">
            {t('signIn.password.label')}
            <span className="text-karma-red" aria-hidden="true">
              {' '}
              *
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="min-h-11 py-2 text-sm font-semibold text-karma-red underline-offset-2 hover:underline"
          >
            {t('signIn.password.forgotPassword')}
          </Link>
        </div>
        <input
          ref={passwordRef}
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-required="true"
          aria-invalid={passwordError ? true : undefined}
          aria-describedby={passwordErrorId}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={cn(
            'min-h-11 rounded-xl border border-karma-tan-dark/40 bg-white px-4 py-2.5 text-base text-karma-ink focus:border-karma-red',
            passwordError && 'border-karma-red',
          )}
        />
        {passwordError && (
          <p id={passwordErrorId} className="text-sm font-medium text-karma-red">
            {passwordError}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? t('signIn.password.submitting') : t('signIn.password.submit')}
      </Button>
    </form>
  )
}
