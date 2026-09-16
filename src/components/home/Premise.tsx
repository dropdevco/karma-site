import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Section, Container, Eyebrow } from '@/components/ui/Section'

export function Premise() {
  const { t } = useTranslation('home')

  return (
    <Section className="py-16 md:py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="md:grid md:grid-cols-12 md:gap-8"
        >
          <div className="md:col-span-4">
            <Eyebrow>{t('premise.eyebrow')}</Eyebrow>
            <p className="mt-4 font-display text-3xl font-extrabold leading-[1.05] text-karma-ink sm:text-4xl">
              {t('premise.lead')}
            </p>
          </div>

          <div className="mt-6 md:col-span-7 md:col-start-6 md:mt-3">
            <p className="text-lg leading-relaxed text-karma-ink-soft sm:text-xl">
              {t('premise.body')}
            </p>
            <p className="mt-6 font-display text-2xl font-black text-karma-red sm:text-3xl">
              {t('premise.highlight')}
            </p>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
