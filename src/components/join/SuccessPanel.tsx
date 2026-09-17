import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Section'

interface SuccessPanelProps {
  name?: string
}

export function SuccessPanel({ name }: SuccessPanelProps) {
  const { t } = useTranslation('join')
  const trimmedName = name?.trim()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      role="status"
      className="rounded-card border border-karma-tan-dark/30 bg-white p-8 text-center sm:p-12"
    >
      <Eyebrow>{t('success.eyebrow')}</Eyebrow>
      <h2 className="mt-3 text-3xl font-bold text-karma-ink sm:text-4xl">
        {trimmedName ? t('success.headingNamed', { name: trimmedName }) : t('success.heading')}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base text-karma-ink-soft">{t('success.body')}</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <ButtonLink to="/account" size="lg">
          {t('success.cta')}
        </ButtonLink>
        <ButtonLink to="/events" variant="secondary" size="lg">
          {t('success.ctaSecondary')}
        </ButtonLink>
      </div>
    </motion.div>
  )
}
