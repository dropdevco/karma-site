import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Section, Container, Eyebrow } from '@/components/ui/Section'

export function MechanismSection() {
  const { t } = useTranslation('about')
  const steps = t('mechanism.steps', { returnObjects: true }) as Array<{
    number: string
    title: string
    description: string
  }>

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
          <Eyebrow>{t('mechanism.eyebrow')}</Eyebrow>
          <h2 className="mt-6 text-3xl font-black leading-tight text-karma-ink sm:text-4xl">
            {t('mechanism.heading')}
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
              className="rounded-card bg-white p-6 sm:p-8"
            >
              <div className="text-5xl font-black text-karma-red sm:text-6xl">
                {step.number}
              </div>
              <h3 className="mt-6 text-xl font-bold text-karma-ink">{step.title}</h3>
              <p className="mt-4 text-karma-ink-soft">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
