import { useTranslation } from 'react-i18next'
import { Section, Container } from '@/components/ui/Section'
import { WhyJoinSection } from '@/components/join/WhyJoinSection'
import { JoinForm } from '@/components/join/JoinForm'

export function Join() {
  const { t } = useTranslation('join')

  return (
    <>
      <WhyJoinSection />
      <Section className="pt-0">
        <Container className="max-w-3xl">
          <div className="rounded-card border border-karma-tan-dark/30 bg-white p-6 shadow-sm sm:p-10">
            <h2 className="text-2xl font-bold text-karma-ink sm:text-3xl">{t('form.heading')}</h2>
            <p className="mt-2 text-karma-ink-soft">{t('form.intro')}</p>
            <div className="mt-8">
              <JoinForm />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
