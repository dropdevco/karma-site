import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Section'
import { DraftBanner } from '@/components/legal/DraftBanner'
import { TableOfContents } from '@/components/legal/TableOfContents'

interface TocItem {
  id: string
  label: string
}

interface CollectItem {
  label: string
  description: string
}

interface CollectSection {
  heading: string
  intro: string
  items: CollectItem[]
}

interface TextSection {
  heading: string
  content: string
}

interface RightsItem {
  label: string
  description: string
}

interface RightsSection {
  heading: string
  intro: string
  items: RightsItem[]
  contactPrompt: string
  contactPlaceholder: string
}

export function Privacy() {
  const { t } = useTranslation('legal')

  const toc = t('privacy.toc.items', { returnObjects: true }) as TocItem[]
  const whatWeCollect = t('privacy.sections.whatWeCollect', { returnObjects: true }) as CollectSection
  const whyWeCollect = t('privacy.sections.whyWeCollect', { returnObjects: true }) as CollectSection
  const eventPhotography = t('privacy.sections.eventPhotography', { returnObjects: true }) as TextSection
  const emailCommunications = t('privacy.sections.emailCommunications', { returnObjects: true }) as TextSection
  const dataSharing = t('privacy.sections.dataSharing', { returnObjects: true }) as TextSection
  const dataRetention = t('privacy.sections.dataRetention', { returnObjects: true }) as TextSection
  const yourRights = t('privacy.sections.yourRights', { returnObjects: true }) as RightsSection
  const minors = t('privacy.sections.minors', { returnObjects: true }) as TextSection

  return (
    <>
      <DraftBanner />

      <div className="flex flex-col gap-8 px-4 py-12 sm:px-6 md:gap-16 md:py-16 lg:px-8">
        <Container className="md:flex md:gap-12">
          {/* Table of Contents - sticky on desktop */}
          <TableOfContents items={toc} title={t('privacy.toc.title')} />

          {/* Main content */}
          <article className="flex-1 min-w-0">
            <header className="mb-8">
              <h1 className="font-display text-3xl font-bold leading-tight text-karma-ink md:text-4xl">
                {t('privacy.pageTitle')}
              </h1>
              <p className="mt-2 text-sm text-karma-ink-soft">
                {t('privacy.lastUpdated')}
              </p>
            </header>

            <p className="mb-8 text-lg leading-relaxed text-karma-ink">
              {t('privacy.intro')}
            </p>

            {/* What We Collect */}
            <section id="what-we-collect" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {whatWeCollect.heading}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-karma-ink">
                {whatWeCollect.intro}
              </p>
              <ul className="mt-6 space-y-4">
                {(whatWeCollect.items as CollectItem[]).map((item, idx) => (
                  <li key={idx} className="border-l-2 border-karma-tan-dark pl-4">
                    <dt className="font-semibold text-karma-ink">{item.label}</dt>
                    <dd className="mt-1 text-karma-ink-soft">{item.description}</dd>
                  </li>
                ))}
              </ul>
            </section>

            {/* Why We Collect */}
            <section id="why-we-collect" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {whyWeCollect.heading}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-karma-ink">
                {whyWeCollect.intro}
              </p>
              <ul className="mt-6 space-y-4">
                {(whyWeCollect.items as CollectItem[]).map((item, idx) => (
                  <li key={idx} className="border-l-2 border-karma-tan-dark pl-4">
                    <dt className="font-semibold text-karma-ink">{item.label}</dt>
                    <dd className="mt-1 text-karma-ink-soft">{item.description}</dd>
                  </li>
                ))}
              </ul>
            </section>

            {/* Event Photography */}
            <section id="event-photography" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {eventPhotography.heading}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-karma-ink">
                {eventPhotography.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Email Communications */}
            <section id="email-communications" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {emailCommunications.heading}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-karma-ink">
                {emailCommunications.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Data Sharing */}
            <section id="data-sharing" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {dataSharing.heading}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-karma-ink">
                {dataSharing.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Data Retention */}
            <section id="data-retention" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {dataRetention.heading}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-karma-ink">
                {dataRetention.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Your Rights */}
            <section id="your-rights" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {yourRights.heading}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-karma-ink">
                {yourRights.intro}
              </p>
              <ul className="mt-6 space-y-4">
                {(yourRights.items as RightsItem[]).map((item, idx) => (
                  <li key={idx} className="border-l-2 border-karma-tan-dark pl-4">
                    <dt className="font-semibold text-karma-ink">{item.label}</dt>
                    <dd className="mt-1 text-karma-ink-soft">{item.description}</dd>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-lg bg-karma-tan-light p-4">
                <p className="text-sm font-semibold text-karma-ink">{yourRights.contactPrompt}</p>
                <p className="mt-2 text-sm text-karma-ink">
                  {yourRights.contactPlaceholder}
                </p>
              </div>
            </section>

            {/* Minors */}
            <section id="minors" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {minors.heading}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-karma-ink">
                {minors.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </section>
          </article>
        </Container>
      </div>
    </>
  )
}
