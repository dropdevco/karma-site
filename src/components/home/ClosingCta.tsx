import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'

export function ClosingCta() {
  const { t } = useTranslation('home')

  return (
    <section className="bg-karma-red py-20 md:py-28">
      <Container className="px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h2 className="font-display text-4xl font-black leading-[1.03] tracking-tight text-white sm:text-5xl">
            {t('closing.heading')}
          </h2>
          <p className="mt-5 text-lg text-white/85 sm:text-xl">{t('closing.subhead')}</p>
          <ButtonLink
            to="/join"
            size="lg"
            variant="secondary"
            className="mt-9 bg-white text-karma-red hover:bg-karma-cream"
          >
            {t('closing.cta')}
          </ButtonLink>
        </motion.div>
      </Container>
    </section>
  )
}
