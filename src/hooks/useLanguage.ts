import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/i18n'

// i18n.language keeps the raw browser tag ("es-MX"), which would miss on
// bilingual content keyed by "es". resolvedLanguage is already narrowed to a
// supported code, but guard anyway so content never renders blank.
export function useLanguage(): LanguageCode {
  const { i18n } = useTranslation()
  const resolved = i18n.resolvedLanguage ?? i18n.language
  const match = SUPPORTED_LANGUAGES.find((lang) => lang.code === resolved)
  return match?.code ?? 'en'
}
