import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

interface ShareButtonProps {
  title: string
  url: string
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const { t } = useTranslation('events')
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled the native share sheet — nothing to do.
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard access denied — no further fallback available.
    }
  }

  return (
    <div className="relative inline-flex">
      <Button type="button" variant="secondary" onClick={() => void handleShare()}>
        {t('detail.share')}
      </Button>
      {copied && (
        <span
          role="status"
          className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-karma-ink px-3 py-1 text-xs text-white"
        >
          {t('detail.shareCopied')}
        </span>
      )}
    </div>
  )
}
