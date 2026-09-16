import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Container, Eyebrow } from '@/components/ui/Section'

export function AboutHero() {
  const { t } = useTranslation('about')

  return (
    <section className="border-b border-karma-tan-dark/20 bg-karma-cream">
      <Container className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-karma-ink sm:text-5xl lg:text-6xl">
            {t('hero.heading')}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-karma-ink-soft sm:text-xl">
            {t('hero.body')}
          </p>
        </motion.div>
      </Container>
    </section>
  )
}
