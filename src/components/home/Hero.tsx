import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'

export function Hero() {
  const { t } = useTranslation('home')

  return (
    <section className="relative overflow-hidden border-b border-karma-tan-dark/20 bg-karma-cream">
      <Container className="grid gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-12 md:items-end md:gap-6 md:pb-24 md:pt-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="md:col-span-7"
        >
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-karma-red">
            {t('hero.eyebrow')}
          </p>
          <h1 className="mt-4 text-[2.75rem] font-black leading-[0.98] tracking-tight text-karma-ink sm:text-6xl lg:text-7xl">
            {t('hero.headline')}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-karma-ink-soft sm:text-xl">
            {t('hero.subhead')}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/join" size="lg">
              {t('hero.ctaPrimary')}
            </ButtonLink>
            <ButtonLink to="/events" size="lg" variant="secondary">
              {t('hero.ctaSecondary')}
            </ButtonLink>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="relative md:col-span-5 md:h-full"
          role="img"
          aria-label={t('hero.imageAlt')}
        >
          {/* Photo slot: real event photography drops in here in a later release. */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-karma-tan">
            <div className="absolute -right-10 -top-10 size-40 rounded-full bg-karma-red" />
            <div className="absolute bottom-8 left-6 size-24 rounded-full border-8 border-karma-cream" />
            <svg
              viewBox="0 0 24 24"
              className="absolute bottom-10 right-8 size-12 fill-karma-red-dark"
              aria-hidden="true"
            >
              <path d="M12 21s-7.5-4.6-10-9.2C.4 8.7 2 5 5.6 5c2 0 3.4 1 4.4 2.4C11 6 12.4 5 14.4 5 18 5 19.6 8.7 22 11.8 19.5 16.4 12 21 12 21z" />
            </svg>
            <div className="absolute left-8 top-10 h-1.5 w-16 -rotate-6 bg-karma-cream/80" />
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
