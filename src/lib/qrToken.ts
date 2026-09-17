/**
 * Check-in codes.
 *
 * A member's QR is not a static string: it is an HMAC over their user id and
 * the current 30-second window, keyed by a per-member secret. That gives two
 * properties the scanner needs at an event with no signal:
 *
 *  - it verifies entirely on-device against a roster cached before doors open,
 *    so check-in never waits on the network, and
 *  - a screenshot goes stale within seconds, so a code texted to a friend who
 *    did not attend will not scan.
 *
 * The server re-derives the same signature in sync_check_ins, so this file and
 * that function must stay byte-identical. Any change here needs a matching
 * change in the migration.
 */

export const QR_PREFIX = 'K1'
export const QR_WINDOW_SECONDS = 30
/** Windows of clock drift tolerated either side of the scan. */
export const QR_WINDOW_TOLERANCE = 3

export interface ParsedQrToken {
  userId: string
  window: number
  sig: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export function currentWindow(atMs: number = Date.now()): number {
  return Math.floor(atMs / 1000 / QR_WINDOW_SECONDS)
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) {
    throw new Error('invalid_secret')
  }
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

function base64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function importKey(secretHex: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    hexToBytes(secretHex) as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

/** Truncated to 16 bytes: still 128 bits of forgery resistance, shorter QR. */
export async function signWindow(
  secretHex: string,
  userId: string,
  window: number,
): Promise<string> {
  const key = await importKey(secretHex)
  const message = new TextEncoder().encode(`${userId}.${window}`)
  const mac = await crypto.subtle.sign('HMAC', key, message as unknown as BufferSource)
  return base64Url(new Uint8Array(mac).slice(0, 16))
}

export async function createQrToken(
  secretHex: string,
  userId: string,
  atMs: number = Date.now(),
): Promise<string> {
  const window = currentWindow(atMs)
  const sig = await signWindow(secretHex, userId, window)
  return `${QR_PREFIX}.${userId}.${window}.${sig}`
}

export function parseQrToken(raw: string): ParsedQrToken | null {
  const parts = raw.trim().split('.')
  if (parts.length !== 4) return null
  const [prefix, userId, windowRaw, sig] = parts
  if (prefix !== QR_PREFIX) return null
  if (!UUID_RE.test(userId)) return null
  if (!/^\d{1,15}$/.test(windowRaw)) return null
  if (!/^[A-Za-z0-9_-]{22}$/.test(sig)) return null
  return { userId, window: Number(windowRaw), sig }
}

export type QrVerifyFailure =
  | 'malformed'
  | 'unknown_member'
  | 'stale_code'
  | 'bad_signature'

export type QrVerifyResult =
  | { ok: true; token: ParsedQrToken }
  | { ok: false; reason: QrVerifyFailure; token: ParsedQrToken | null }

/**
 * Verifies a scanned code offline. `lookupSecret` reads the roster cached on
 * the device, so this never touches the network.
 */
export async function verifyQrToken(
  raw: string,
  lookupSecret: (userId: string) => string | undefined,
  atMs: number = Date.now(),
): Promise<QrVerifyResult> {
  const token = parseQrToken(raw)
  if (!token) return { ok: false, reason: 'malformed', token: null }

  const secret = lookupSecret(token.userId)
  if (!secret) return { ok: false, reason: 'unknown_member', token }

  if (Math.abs(token.window - currentWindow(atMs)) > QR_WINDOW_TOLERANCE) {
    return { ok: false, reason: 'stale_code', token }
  }

  const expected = await signWindow(secret, token.userId, token.window)
  if (!timingSafeEqual(expected, token.sig)) {
    return { ok: false, reason: 'bad_signature', token }
  }

  return { ok: true, token }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
