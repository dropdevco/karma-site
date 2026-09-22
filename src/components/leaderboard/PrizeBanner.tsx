import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export function PrizeBanner() {
  const { t } = useTranslation('leaderboard')

  return (
    <div className="rounded-card bg-karma-red px-6 py-8 text-white sm:px-10 sm:py-10">
      <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white/80">
        {t('prize.eyebrow')}
      </p>
      <p className="mt-3 font-display text-2xl font-black leading-tight sm:text-3xl">
        {t('prize.headline')}
      </p>
      <p className="mt-3 max-w-xl text-white/85">{t('prize.body')}</p>
      <Link
        to="/terms"
        className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-white underline underline-offset-4 hover:text-white/80"
      >
        {t('prize.rulesLink')}
      </Link>
    </div>
  )
}
