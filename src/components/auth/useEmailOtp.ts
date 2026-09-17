import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { classifyAuthError, classifyThrown, type AuthErrorCode } from './otpErrors'

export type OtpStep = 'email' | 'code'

const RESEND_COOLDOWN_SECONDS = 30
const CODE_PATTERN = /^\d{6,10}$/

export interface UseEmailOtpResult {
  step: OtpStep
  email: string
  sending: boolean
  verifying: boolean
  errorCode: AuthErrorCode | null
  cooldown: number
  sendCode: (email: string) => Promise<boolean>
  verifyCode: (code: string) => Promise<boolean>
  resend: () => Promise<boolean>
  changeEmail: () => void
}

export function useEmailOtp(): UseEmailOtpResult {
  const [step, setStep] = useState<OtpStep>('email')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [errorCode, setErrorCode] = useState<AuthErrorCode | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const requestCode = useCallback(async (targetEmail: string) => {
    setSending(true)
    setErrorCode(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      })
      // A cooldown is applied whether the request succeeded or not, so a
      // flaky send can't be used to hammer the rate limit.
      setCooldown(RESEND_COOLDOWN_SECONDS)
      if (error) {
        setErrorCode(classifyAuthError(error, 'send'))
        return false
      }
      setEmail(targetEmail)
      setStep('code')
      return true
    } catch (err) {
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setErrorCode(classifyThrown(err))
      return false
    } finally {
      setSending(false)
    }
  }, [])

  const sendCode = useCallback(
    (targetEmail: string) => requestCode(targetEmail.trim().toLowerCase()),
    [requestCode],
  )

  const resend = useCallback(() => {
    if (cooldown > 0 || !email) return Promise.resolve(false)
    return requestCode(email)
  }, [cooldown, email, requestCode])

  const verifyCode = useCallback(
    async (rawCode: string) => {
      const token = rawCode.trim()
      if (!CODE_PATTERN.test(token)) {
        setErrorCode('codeFormat')
        return false
      }
      setVerifying(true)
      setErrorCode(null)
      try {
        const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
        if (error) {
          setErrorCode(classifyAuthError(error, 'verify'))
          return false
        }
        return true
      } catch (err) {
        setErrorCode(classifyThrown(err))
        return false
      } finally {
        setVerifying(false)
      }
    },
    [email],
  )

  const changeEmail = useCallback(() => {
    setStep('email')
    setErrorCode(null)
    setCooldown(0)
  }, [])

  return { step, email, sending, verifying, errorCode, cooldown, sendCode, verifyCode, resend, changeEmail }
}
