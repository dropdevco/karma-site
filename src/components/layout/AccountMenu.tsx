import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/Button'

interface MenuItemProps {
  label: string
  onClick: () => void
}

function MenuItem({ label, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-3 text-base font-medium text-karma-ink hover:bg-karma-tan-light rounded-lg transition-colors"
    >
      {label}
    </button>
  )
}

export function AccountMenu() {
  const { t } = useTranslation()
  const { profile, status, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const firstName = profile?.full_name
    ? profile.full_name.split(' ')[0]
    : t('account.accountLabel')

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  const handleMenuClick = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  // Handle outside clicks
  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="secondary"
        size="sm"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {firstName}
      </Button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full mt-2 w-48 rounded-card bg-karma-cream border border-karma-tan-dark/20 shadow-lg z-50"
        >
          <MenuItem
            label={t('account.myQR')}
            onClick={() => handleMenuClick('/account/qr')}
          />
          <MenuItem
            label={t('account.myEvents')}
            onClick={() => handleMenuClick('/account/events')}
          />
          <MenuItem
            label={t('account.account')}
            onClick={() => handleMenuClick('/account')}
          />

          {(status?.role === 'staff' || status?.role === 'admin') && (
            <MenuItem
              label={t('account.staffArea')}
              onClick={() => handleMenuClick('/staff')}
            />
          )}

          <div className="border-t border-karma-tan-dark/20" />

          <MenuItem label={t('account.signOut')} onClick={handleSignOut} />
        </div>
      )}
    </div>
  )
}
