import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Section'

interface SuccessPanelProps {
  name: string
  email: string
  onReset: () => void
}

export function SuccessPanel({ name, email, onReset }: SuccessPanelProps) {
  const { t } = useTranslation('join')

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
        {t('success.heading', { name })}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base text-karma-ink-soft">
        {t('success.body1', { email })}
      </p>
      <p className="mx-auto mt-3 max-w-xl text-base text-karma-ink-soft">{t('success.body2')}</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <ButtonLink to="/events" size="lg">
          {t('success.cta')}
        </ButtonLink>
        <Button type="button" variant="ghost" size="lg" onClick={onReset}>
          {t('success.another')}
        </Button>
      </div>
    </motion.div>
  )
}
