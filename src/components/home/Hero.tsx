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
          {/* Photo slot: real event photography drops in here in a later release.
              Until then the brand mark holds the space. */}
          <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-card bg-karma-tan-light">
            <div className="absolute -right-12 -top-12 size-44 rounded-full bg-karma-tan" />
            <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-karma-tan" />
            <picture className="relative flex h-3/5 items-center justify-center">
              <source
                type="image/webp"
                srcSet="/brand/karma-mark-256.webp 1x, /brand/karma-mark-512.webp 2x"
              />
              <img
                src="/brand/karma-mark-256.png"
                srcSet="/brand/karma-mark-256.png 1x, /brand/karma-mark-512.png 2x"
                alt=""
                width={256}
                height={314}
                className="h-full w-auto drop-shadow-sm"
              />
            </picture>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
