import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/hooks/useLanguage'
import { motion } from 'motion/react'
import { Section, Container } from '@/components/ui/Section'
import { beneficiaries } from '@/data/beneficiaries'

type PartnerCardProps = {
  index: number
}

function PartnerCard({ index }: PartnerCardProps) {
  const language = useLanguage()
  const partner = beneficiaries[index]

  if (!partner) return null

  const categoryLabels: Record<string, Record<string, string>> = {
    en: {
      'foster-home': 'Foster Home Network',
      'family-services': 'Family Services',
      'youth-shelter': 'Youth Shelter',
      'housing-support': 'Housing Support',
    },
    es: {
      'foster-home': 'Red de Hogares de Acogida',
      'family-services': 'Servicios Familiares',
      'youth-shelter': 'Refugio para Jóvenes',
      'housing-support': 'Apoyo de Vivienda',
    },
  }

  const categoryLabel = categoryLabels[language][partner.category]
  const description =
    language === 'es' ? partner.description.es : partner.description.en
  const mostNeeded = language === 'es' ? partner.mostNeeded.es : partner.mostNeeded.en
  const servesAround =
    language === 'es' ? partner.servesAround.es : partner.servesAround.en

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      viewport={{ once: true, margin: '-100px' }}
      className="group overflow-hidden rounded-card bg-white p-6 sm:p-8 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      {/* Placeholder image */}
      <div className="mb-6 aspect-video w-full rounded-lg bg-gradient-to-br from-karma-tan to-karma-tan-dark" />

      <p className="text-sm font-bold uppercase tracking-widest text-karma-red">
        {categoryLabel}
      </p>
      <h3 className="mt-3 text-xl font-black text-karma-ink sm:text-2xl">{partner.name}</h3>

      <p className="mt-4 text-karma-ink-soft">{description}</p>

      <div className="mt-6 space-y-3 border-t border-karma-tan-light pt-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-karma-red">
            {language === 'es' ? 'Lo más necesario' : 'Most needed'}
          </p>
          <p className="mt-2 text-sm text-karma-ink-soft">{mostNeeded}</p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-karma-red">
            {language === 'es' ? 'Sirve alrededor de' : 'Serves around'}
          </p>
          <p className="mt-2 text-sm text-karma-ink-soft">{servesAround}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function PartnersGrid() {
  const { t } = useTranslation('beneficiaries')

  return (
    <Section>
      <Container className="px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-3xl font-black leading-tight text-karma-ink sm:text-4xl"
        >
          {t('partners.heading')}
        </motion.h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {beneficiaries.map((_, index) => (
            <PartnerCard key={index} index={index} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
