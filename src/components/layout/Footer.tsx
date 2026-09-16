import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from './Logo'

const exploreLinks = [
  { to: '/events', key: 'nav.events' },
  { to: '/about', key: 'nav.about' },
  { to: '/beneficiaries', key: 'nav.beneficiaries' },
  { to: '/join', key: 'nav.join' },
] as const

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-karma-tan-dark/20 bg-karma-tan-light/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-karma-ink-soft">
              {t('footer.blurb')}
            </p>
          </div>

          <nav aria-label={t('footer.explore')}>
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-karma-ink">
              {t('footer.explore')}
            </h2>
            <ul className="mt-4 space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-karma-ink-soft transition-colors hover:text-karma-red"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('footer.legal')}>
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-karma-ink">
              {t('footer.legal')}
            </h2>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-karma-ink-soft transition-colors hover:text-karma-red"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-karma-ink-soft transition-colors hover:text-karma-red"
                >
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-karma-tan-dark/25 pt-6 text-xs text-karma-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {t('org.name')}. {t('footer.rights')}
          </p>
          <p>{t('footer.builtWith')}</p>
        </div>
      </div>
    </footer>
  )
}
