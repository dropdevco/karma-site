import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Section, Container, Eyebrow } from '@/components/ui/Section'

export function DifferenceSection() {
  const { t } = useTranslation('about')
  const values = t('difference.values', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>

  return (
    <Section>
      <Container className="px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <Eyebrow>{t('difference.eyebrow')}</Eyebrow>
          <h2 className="mt-6 max-w-3xl text-3xl font-black leading-tight text-karma-ink sm:text-4xl">
            {t('difference.heading')}
          </h2>
        </motion.div>

        <div className="mt-16 space-y-10 sm:space-y-14">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
              className="grid gap-6 sm:gap-8 md:grid-cols-12 md:items-start"
            >
              {/* Asymmetric layout: alternate content position */}
              {index % 2 === 0 ? (
                <>
                  <div className="md:col-span-5">
                    <div className="rounded-card bg-karma-tan-light p-6 sm:p-8">
                      {/* Solid color block — image placeholder */}
                      <div className="aspect-square w-full rounded-lg bg-karma-tan" />
                    </div>
                  </div>
                  <div className="md:col-span-7">
                    <h3 className="text-2xl font-black text-karma-ink sm:text-3xl">
                      {value.title}
                    </h3>
                    <p className="mt-4 text-lg text-karma-ink-soft leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="md:col-span-7 md:order-2">
                    <h3 className="text-2xl font-black text-karma-ink sm:text-3xl">
                      {value.title}
                    </h3>
                    <p className="mt-4 text-lg text-karma-ink-soft leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                  <div className="md:col-span-5 md:order-1">
                    <div className="rounded-card bg-karma-tan-light p-6 sm:p-8">
                      {/* Solid color block — image placeholder */}
                      <div className="aspect-square w-full rounded-lg bg-karma-tan" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
