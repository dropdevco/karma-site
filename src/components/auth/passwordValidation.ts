export const MIN_PASSWORD_LENGTH = 8

export type PasswordValidationError = 'tooShort' | 'mismatch'

/**
 * Shared minimum-length + match check for any "set a new password" form
 * (join's password step, the reset-password page, and potentially
 * account's password section down the line).
 */
export function validateNewPassword(
  password: string,
  confirmPassword: string,
): PasswordValidationError | null {
  if (password.length < MIN_PASSWORD_LENGTH) return 'tooShort'
  if (password !== confirmPassword) return 'mismatch'
  return null
}
