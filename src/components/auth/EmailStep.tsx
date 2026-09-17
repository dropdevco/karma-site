import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/join/TextField'
import type { AuthErrorCode } from './otpErrors'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface EmailStepProps {
  initialEmail?: string
  sending: boolean
  errorCode: AuthErrorCode | null
  onSubmit: (email: string) => Promise<boolean>
}

export function EmailStep({ initialEmail = '', sending, errorCode, onSubmit }: EmailStepProps) {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState(initialEmail)
  const [touched, setTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const localError = !email.trim()
    ? t('errors.emailRequired')
    : !EMAIL_RE.test(email.trim())
      ? t('errors.emailInvalid')
      : undefined

  const serverError = errorCode ? t(`errors.${errorCode}`) : undefined
  const error = touched && localError ? localError : serverError

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (localError) {
      inputRef.current?.focus()
      return
    }
    const ok = await onSubmit(email.trim())
    if (!ok) inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div aria-live="polite" role="status" className="sr-only">
        {error ?? ''}
      </div>
      <TextField
        id="signin-email"
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
      <Button type="submit" size="lg" disabled={sending} className="w-full">
        {sending ? t('emailStep.submitting') : t('emailStep.submit')}
      </Button>
    </form>
  )
}
