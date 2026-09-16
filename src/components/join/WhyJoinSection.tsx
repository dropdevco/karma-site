import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { cn } from '@/lib/cn'

export function WhyJoinSection() {
  const { t } = useTranslation('join')

  const items = [
    { key: 'games', title: t('why.games.title'), body: t('why.games.body') },
    { key: 'community', title: t('why.community.title'), body: t('why.community.body') },
    { key: 'points', title: t('why.points.title'), body: t('why.points.body') },
    { key: 'prize', title: t('why.prize.title'), body: t('why.prize.body') },
  ] as const

  return (
    <Section className="pb-8 pt-16 sm:pt-20 md:pb-12">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
          <h1 className="mt-3 text-4xl font-bold text-karma-ink sm:text-5xl md:text-6xl">
            {t('hero.headline')}
          </h1>
          <p className="mt-4 text-lg text-karma-ink-soft">{t('hero.subhead')}</p>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Eyebrow>{t('why.eyebrow')}</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-karma-ink sm:text-3xl">
              {t('why.heading')}
            </h2>
          </div>
          {items.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className={cn(
                'border-t border-karma-tan-dark/30 pt-5',
                index === items.length - 1 &&
                  'sm:col-span-2 sm:border-t-2 sm:border-karma-red/50',
              )}
            >
              <p className="font-display text-lg font-bold text-karma-ink">{item.title}</p>
              <p className="mt-2 text-karma-ink-soft">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
