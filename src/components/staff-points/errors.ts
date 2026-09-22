const AWARD_ERROR_CODES = ['forbidden', 'invalid_points', 'note_required', 'member_not_found'] as const

export type AwardErrorCode = (typeof AWARD_ERROR_CODES)[number] | 'unknown'

/**
 * `award_manual_points` raises these as bare Postgres exception messages.
 * They aren't in the shared `rpcErrorCode` allowlist (src/lib/supabase.ts is
 * another feature's territory this round), so this page matches them itself.
 */
export function awardErrorCode(error: unknown): AwardErrorCode {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : ''
  for (const code of AWARD_ERROR_CODES) {
    if (message.includes(code)) return code
  }
  return 'unknown'
}
