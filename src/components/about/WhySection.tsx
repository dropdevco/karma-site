import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Section, Container, Eyebrow } from '@/components/ui/Section'

export function WhySection() {
  const { t } = useTranslation('about')

  return (
    <Section>
      <Container className="px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-3xl"
        >
          <Eyebrow>{t('why.eyebrow')}</Eyebrow>
          <h2 className="mt-6 text-3xl font-black leading-tight text-karma-ink sm:text-4xl">
            {t('why.heading')}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-karma-ink-soft">
            {t('why.body')}
          </p>
        </motion.div>
      </Container>
    </Section>
  )
}
