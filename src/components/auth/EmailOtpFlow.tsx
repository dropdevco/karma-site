import { useEmailOtp } from './useEmailOtp'
import { EmailStep } from './EmailStep'
import { CodeStep } from './CodeStep'

interface EmailOtpFlowProps {
  onVerified: () => void
  initialEmail?: string
}

export function EmailOtpFlow({ onVerified, initialEmail }: EmailOtpFlowProps) {
  const otp = useEmailOtp()

  async function handleVerify(code: string) {
    const ok = await otp.verifyCode(code)
    if (ok) onVerified()
    return ok
  }

  if (otp.step === 'email') {
    return (
      <EmailStep
        initialEmail={initialEmail}
        sending={otp.sending}
        errorCode={otp.errorCode}
        onSubmit={otp.sendCode}
      />
    )
  }

  return (
    <CodeStep
      email={otp.email}
      verifying={otp.verifying}
      errorCode={otp.errorCode}
      cooldown={otp.cooldown}
      onSubmit={handleVerify}
      onResend={() => {
        void otp.resend()
      }}
      onChangeEmail={otp.changeEmail}
    />
  )
}
