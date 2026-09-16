import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'

export function ApplySection() {
  const { t } = useTranslation('beneficiaries')

  return (
    <Section className="bg-karma-red-soft">
      <Container className="px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-3xl"
        >
          <Eyebrow>{t('apply.eyebrow')}</Eyebrow>
          <h2 className="mt-6 text-3xl font-black leading-tight text-karma-ink sm:text-4xl">
            {t('apply.heading')}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-karma-ink-soft">
            {t('apply.body')}
          </p>
          <div className="mt-8">
            <ButtonLink to="/join" variant="primary" size="lg">
              {t('apply.cta')}
            </ButtonLink>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
