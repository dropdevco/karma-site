import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Container, Eyebrow } from '@/components/ui/Section'

type Stat = {
  value: string
  label: string
}

// Placeholder figures for Release 1 launch copy. Real, live numbers pulled
// from event/donation data are wired up in Release 4 — do not treat as fact.
export function ImpactNumbers() {
  const { t } = useTranslation('home')
  const stats = t('impact.stats', { returnObjects: true }) as Stat[]

  return (
    <section className="bg-karma-ink py-16 md:py-24">
      <Container className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <Eyebrow className="text-karma-tan">{t('impact.eyebrow')}</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
            {t('impact.heading')}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <p className="font-display text-4xl font-black text-karma-red sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium uppercase tracking-wide text-karma-tan-light sm:text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-xs text-karma-tan-dark">{t('impact.note')}</p>
      </Container>
    </section>
  )
}
