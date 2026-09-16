import type { LanguageCode } from '@/i18n'

const LOCALE_MAP: Record<LanguageCode, string> = {
  en: 'en-US',
  es: 'es-US',
}

export function toLanguageCode(lang: string | undefined): LanguageCode {
  return lang?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

function resolveLocale(lang: LanguageCode): string {
  return LOCALE_MAP[lang]
}

export function formatDateShort(iso: string, lang: LanguageCode): string {
  return new Intl.DateTimeFormat(resolveLocale(lang), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

export function formatDateLong(iso: string, lang: LanguageCode): string {
  return new Intl.DateTimeFormat(resolveLocale(lang), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatTimeRange(startIso: string, endIso: string, lang: LanguageCode): string {
  const formatter = new Intl.DateTimeFormat(resolveLocale(lang), { hour: 'numeric', minute: '2-digit' })
  return `${formatter.format(new Date(startIso))}–${formatter.format(new Date(endIso))}`
}

export function formatMonthYear(iso: string, lang: LanguageCode): string {
  const label = new Intl.DateTimeFormat(resolveLocale(lang), { month: 'long', year: 'numeric' }).format(
    new Date(iso),
  )
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function monthKey(iso: string): string {
  const date = new Date(iso)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
