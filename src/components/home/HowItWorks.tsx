import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Section, Container, Eyebrow } from '@/components/ui/Section'

type Step = {
  number: string
  title: string
  description: string
}

export function HowItWorks() {
  const { t } = useTranslation('home')
  const steps = t('howItWorks.steps', { returnObjects: true }) as Step[]

  return (
    <Section className="border-y border-karma-tan-dark/20 bg-karma-tan-light/50 py-16 md:py-24">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>{t('howItWorks.eyebrow')}</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-karma-ink sm:text-4xl">
            {t('howItWorks.heading')}
          </h2>
        </div>

        <ol className="mt-12 divide-y divide-karma-tan-dark/30 border-t border-karma-tan-dark/30">
          {steps.map((step, index) => (
            <motion.li
              key={step.number}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="flex flex-col gap-2 py-8 sm:flex-row sm:items-baseline sm:gap-8 md:py-10"
            >
              <span
                className="font-display text-5xl font-black text-karma-tan-dark sm:w-32 sm:shrink-0 sm:text-6xl"
                aria-hidden="true"
              >
                {step.number}
              </span>
              <div className="max-w-xl">
                <h3 className="font-display text-xl font-bold text-karma-ink sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-base text-karma-ink-soft sm:text-lg">
                  {step.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </Container>
    </Section>
  )
}
