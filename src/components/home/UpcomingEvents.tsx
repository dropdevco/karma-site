import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ButtonLink } from '@/components/ui/Button'
import { Section, Container, Eyebrow } from '@/components/ui/Section'
import { cn } from '@/lib/cn'

type EventTeaser = {
  sport: string
  title: string
  day: string
  date: string
  location: string
  donation: string
}

export function UpcomingEvents() {
  const { t } = useTranslation('home')
  const events = t('events.items', { returnObjects: true }) as EventTeaser[]

  return (
    <Section className="border-t border-karma-tan-dark/20 bg-karma-tan-light/40 py-16 md:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <Eyebrow>{t('events.eyebrow')}</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-karma-ink sm:text-4xl">
              {t('events.heading')}
            </h2>
          </div>
          <ButtonLink to="/events" variant="ghost" className="self-start sm:self-auto">
            {t('events.cta')}
          </ButtonLink>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {events.map((event, index) => (
            <motion.article
              key={event.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={cn(
                'flex flex-col justify-between rounded-card border border-karma-tan-dark/30 bg-karma-cream p-6',
                index === 0 && 'md:col-span-2 md:row-span-1 md:p-8',
              )}
            >
              <div>
                <span className="font-display text-xs font-bold uppercase tracking-[0.15em] text-karma-red">
                  {event.sport}
                </span>
                <h3
                  className={cn(
                    'mt-3 font-display font-bold text-karma-ink',
                    index === 0 ? 'text-2xl sm:text-3xl' : 'text-xl',
                  )}
                >
                  {event.title}
                </h3>
                <p className="mt-2 text-karma-ink-soft">{event.location}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-karma-tan-dark/30 pt-4">
                <div>
                  <p className="font-display text-lg font-black leading-none text-karma-ink">
                    {event.date}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-karma-ink-soft">
                    {event.day}
                  </p>
                </div>
                <p className="rounded-full bg-karma-tan-light px-3 py-1.5 text-xs font-semibold text-karma-ink-soft">
                  {event.donation}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
