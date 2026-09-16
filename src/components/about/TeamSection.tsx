import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Section, Container, Eyebrow } from '@/components/ui/Section'

export function TeamSection() {
  const { t } = useTranslation('about')

  return (
    <Section>
      <Container className="px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <Eyebrow>{t('team.eyebrow')}</Eyebrow>
          <h2 className="mt-6 text-3xl font-black leading-tight text-karma-ink sm:text-4xl">
            {t('team.heading')}
          </h2>

          <div className="mt-10 rounded-card border-2 border-karma-tan-dark bg-karma-tan-light/50 p-6 sm:p-8">
            <p className="text-center text-karma-ink-soft">{t('team.note')}</p>
          </div>

          {/* Placeholder team member grid — structured so real photos drop in later */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                viewport={{ once: true, margin: '-100px' }}
                className="text-center"
              >
                {/* Photo placeholder */}
                <div className="mb-4 aspect-square w-full rounded-card bg-karma-tan" />
                {/* Name placeholder */}
                <div className="h-6 w-3/4 rounded bg-karma-tan-light mx-auto" />
                {/* Role placeholder */}
                <div className="mt-2 h-4 w-2/3 rounded bg-karma-tan-light/60 mx-auto" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
