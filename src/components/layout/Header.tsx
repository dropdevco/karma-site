import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from './Logo'
import { LanguageToggle } from './LanguageToggle'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { useAuth } from '@/auth/useAuth'
import { AccountMenu } from './AccountMenu'

const links = [
  { to: '/events', key: 'nav.events' },
  { to: '/about', key: 'nav.about' },
  { to: '/beneficiaries', key: 'nav.beneficiaries' },
] as const

function MobileAccountMenuItems({
  onClose,
}: {
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { status, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    onClose()
    await signOut()
    navigate('/')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onClose()
          navigate('/account/qr')
        }}
        className="w-full text-left rounded-xl px-4 py-3 text-base font-medium text-karma-ink hover:bg-karma-tan-light transition-colors"
      >
        {t('account.myQR')}
      </button>
      <button
        type="button"
        onClick={() => {
          onClose()
          navigate('/account/events')
        }}
        className="w-full text-left rounded-xl px-4 py-3 text-base font-medium text-karma-ink hover:bg-karma-tan-light transition-colors"
      >
        {t('account.myEvents')}
      </button>
      <button
        type="button"
        onClick={() => {
          onClose()
          navigate('/account')
        }}
        className="w-full text-left rounded-xl px-4 py-3 text-base font-medium text-karma-ink hover:bg-karma-tan-light transition-colors"
      >
        {t('account.account')}
      </button>
      {(status?.role === 'staff' || status?.role === 'admin') && (
        <button
          type="button"
          onClick={() => {
            onClose()
            navigate('/staff')
          }}
          className="w-full text-left rounded-xl px-4 py-3 text-base font-medium text-karma-ink hover:bg-karma-tan-light transition-colors"
        >
          {t('account.staffArea')}
        </button>
      )}
      <div className="mt-3 pt-3 border-t border-karma-tan-dark/20">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full text-left rounded-xl px-4 py-3 text-base font-medium text-karma-ink hover:bg-karma-tan-light transition-colors"
        >
          {t('account.signOut')}
        </button>
      </div>
    </>
  )
}

export function Header() {
  const { t } = useTranslation()
  const { loading, session } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-karma-tan-dark/20 bg-karma-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-h-11 shrink-0 items-center" aria-label={t('org.name')}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-karma-tan-light text-karma-ink'
                    : 'text-karma-ink-soft hover:text-karma-ink',
                )
              }
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          {loading ? (
            <div className="h-9 w-20 rounded-full bg-karma-tan-light" />
          ) : session ? (
            <AccountMenu />
          ) : (
            <>
              <ButtonLink to="/signin" variant="ghost" size="sm">
                {t('nav.signIn')}
              </ButtonLink>
              <ButtonLink to="/join" size="sm">
                {t('cta.join')}
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? t('nav.close') : t('nav.menu')}
          className="-mr-2 flex size-11 items-center justify-center rounded-full text-karma-ink md:hidden"
        >
          <span className="relative block h-4 w-6" aria-hidden="true">
            <span
              className={cn(
                'absolute left-0 h-0.5 w-6 rounded bg-current transition-transform duration-200',
                open ? 'top-1/2 rotate-45' : 'top-0',
              )}
            />
            <span
              className={cn(
                'absolute left-0 top-1/2 h-0.5 w-6 -translate-y-1/2 rounded bg-current transition-opacity duration-200',
                open && 'opacity-0',
              )}
            />
            <span
              className={cn(
                'absolute left-0 h-0.5 w-6 rounded bg-current transition-transform duration-200',
                open ? 'top-1/2 -rotate-45' : 'bottom-0',
              )}
            />
          </span>
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-karma-tan-dark/20 bg-karma-cream md:hidden"
        >
          <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-4 py-3 text-base font-medium',
                    isActive ? 'bg-karma-tan-light text-karma-ink' : 'text-karma-ink-soft',
                  )
                }
              >
                {t(link.key)}
              </NavLink>
            ))}

            {loading ? (
              <div className="mt-3 h-10 w-24 rounded-full bg-karma-tan-light" />
            ) : session ? (
              <MobileAccountMenuItems onClose={() => setOpen(false)} />
            ) : (
              <NavLink
                to="/signin"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-4 py-3 text-base font-medium block',
                    isActive ? 'bg-karma-tan-light text-karma-ink' : 'text-karma-ink-soft',
                  )
                }
              >
                {t('nav.signIn')}
              </NavLink>
            )}

            <div className="mt-3 flex items-center justify-between gap-3">
              <LanguageToggle />
              {!loading && !session && (
                <ButtonLink to="/join" className="flex-1" onClick={() => setOpen(false)}>
                  {t('cta.join')}
                </ButtonLink>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
