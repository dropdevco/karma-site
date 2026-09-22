import type { LanguageCode } from '@/i18n'

const LOCALE_MAP: Record<LanguageCode, string> = {
  en: 'en-US',
  es: 'es-US',
}

export function formatLoggedAt(iso: string, lang: LanguageCode): string {
  return new Intl.DateTimeFormat(LOCALE_MAP[lang], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

/** Picks the beneficiary string for the active language, falling back to whichever translation is actually filled in. */
export function pickBilingual(en: string | null, es: string | null, lang: LanguageCode): string | null {
  const primary = lang === 'es' ? es : en
  const secondary = lang === 'es' ? en : es
  const value = primary?.trim() ? primary : secondary
  return value?.trim() ? value : null
}
