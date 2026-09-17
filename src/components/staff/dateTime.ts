function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * Converts a stored UTC ISO timestamp into the value a `datetime-local`
 * input expects, expressed in the browser's own timezone. Reads back with
 * local getters (not UTC ones) so the wall-clock time the input shows
 * matches what the person originally typed on this device.
 */
export function isoToDateTimeLocal(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Converts a `datetime-local` input value (no timezone attached) into a UTC
 * ISO string for storage. The `Date` constructor treats a timezone-free
 * string as local wall-clock time, so this is the inverse of
 * `isoToDateTimeLocal` as long as it runs in the same timezone.
 */
export function dateTimeLocalToIso(value: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export function currentTimeZoneLabel(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'local time'
  }
}
