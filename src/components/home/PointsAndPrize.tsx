import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ButtonLink } from '@/components/ui/Button'
import { Section, Container, Eyebrow } from '@/components/ui/Section'

export function PointsAndPrize() {
  const { t } = useTranslation('home')

  return (
    <Section className="py-16 md:py-24">
      <Container className="grid gap-10 md:grid-cols-12 md:items-center md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="md:col-span-7"
        >
          <Eyebrow>{t('points.eyebrow')}</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-black leading-tight tracking-tight text-karma-ink sm:text-4xl">
            {t('points.heading')}
          </h2>
          <p className="mt-5 max-w-lg text-lg text-karma-ink-soft">{t('points.body')}</p>
          <ButtonLink to="/join" className="mt-8" variant="secondary">
            {t('points.cta')}
          </ButtonLink>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, rotate: -2, scale: 0.96 }}
          whileInView={{ opacity: 1, rotate: -2, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative md:col-span-5"
        >
          <div className="relative -rotate-2 rounded-card bg-karma-red px-8 py-10 text-white shadow-xl">
            <div
              className="absolute inset-y-6 left-0 w-0 border-l-2 border-dashed border-white/30"
              aria-hidden="true"
            />
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">
              {t('points.prizeLabel')}
            </p>
            <p className="mt-3 font-display text-5xl font-black sm:text-6xl">
              {t('points.prizeAmount')}
            </p>
            <p className="mt-4 max-w-xs text-sm text-white/85 sm:text-base">
              {t('points.prizeDetail')}
            </p>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
