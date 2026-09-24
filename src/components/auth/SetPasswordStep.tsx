import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { supabase } from '@/lib/supabase'
import { MIN_PASSWORD_LENGTH, validateNewPassword } from './passwordValidation'
import { classifyPasswordUpdateError, classifyThrownPasswordError, type PasswordUpdateErrorCode } from './passwordErrors'

interface SetPasswordStepProps {
  onDone: () => void
}

export function SetPasswordStep({ onDone }: SetPasswordStepProps) {
  const { t } = useTranslation('join')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorCode, setErrorCode] = useState<PasswordUpdateErrorCode | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)
  const confirmRef = useRef<HTMLInputElement | null>(null)

  const validationError = touched ? validateNewPassword(password, confirmPassword) : null
  const localError = validationError ? t(`password.errors.${validationError}`, { count: MIN_PASSWORD_LENGTH }) : undefined
  const serverError = errorCode ? t(`password.errors.${errorCode}`) : undefined
  const error = serverError ?? localError
  const errorId = error ? 'set-password-error' : undefined

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
      onDone()
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
        {error ?? ''}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="join-new-password" className="font-display text-sm font-semibold text-karma-ink">
          {t('password.newLabel')}
          <span className="text-karma-red" aria-hidden="true">
            {' '}
            *
          </span>
        </label>
        <input
          ref={passwordRef}
          id="join-new-password"
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
        <label htmlFor="join-confirm-password" className="font-display text-sm font-semibold text-karma-ink">
          {t('password.confirmLabel')}
          <span className="text-karma-red" aria-hidden="true">
            {' '}
            *
          </span>
        </label>
        <input
          ref={confirmRef}
          id="join-confirm-password"
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
        {submitting ? t('password.submitting') : t('password.submit')}
      </Button>
    </form>
  )
}
