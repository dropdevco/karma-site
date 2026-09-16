import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'

export function InvolvedSection() {
  const { t } = useTranslation('about')

  return (
    <Section className="bg-karma-red-soft">
      <Container className="px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <Eyebrow>{t('involved.eyebrow')}</Eyebrow>
          <h2 className="mt-6 text-3xl font-black leading-tight text-karma-ink sm:text-4xl">
            {t('involved.heading')}
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Play option */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="rounded-card bg-white p-8 sm:p-10"
          >
            <h3 className="text-2xl font-black text-karma-ink">{t('involved.playHeading')}</h3>
            <p className="mt-4 leading-relaxed text-karma-ink-soft">{t('involved.playBody')}</p>
            <div className="mt-8">
              <ButtonLink to="/events" variant="primary">
                {t('involved.playCTA')}
              </ButtonLink>
            </div>
          </motion.div>

          {/* Volunteer option */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="rounded-card bg-white p-8 sm:p-10"
          >
            <h3 className="text-2xl font-black text-karma-ink">
              {t('involved.volunteerHeading')}
            </h3>
            <p className="mt-4 leading-relaxed text-karma-ink-soft">
              {t('involved.volunteerBody')}
            </p>
            <div className="mt-8">
              <ButtonLink to="/join" variant="primary">
                {t('involved.volunteerCTA')}
              </ButtonLink>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  )
}
