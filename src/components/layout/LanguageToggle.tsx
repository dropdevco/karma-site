import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '@/i18n'
import { cn } from '@/lib/cn'

export function LanguageToggle({ className }: { className?: string }) {
  const { i18n, t } = useTranslation()
  const active = i18n.resolvedLanguage ?? 'en'

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-karma-tan-dark/40 bg-white/70 p-0.5',
        className,
      )}
      role="group"
      aria-label={t('lang.switch')}
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = active === lang.code
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => void i18n.changeLanguage(lang.code)}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'rounded-full px-3 py-1 font-display text-xs font-bold tracking-wider transition-colors',
              isActive
                ? 'bg-karma-red text-white'
                : 'text-karma-ink-soft hover:text-karma-ink',
            )}
          >
            <span className="sr-only">{lang.label}</span>
            <span aria-hidden="true">{lang.short}</span>
          </button>
        )
      })}
    </div>
  )
}
