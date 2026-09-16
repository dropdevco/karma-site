import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Section'
import { DraftBanner } from '@/components/legal/DraftBanner'
import { TableOfContents } from '@/components/legal/TableOfContents'

interface TocItem {
  id: string
  label: string
}

interface TextSection {
  heading: string
  content: string
}

interface ConductSection {
  heading: string
  intro: string
  items: Array<{ label: string; description: string }>
  enforcement: string
}

interface PrizeItem {
  label: string
  description: string
}

interface PrizeRules {
  earning: string
  earningItems: Array<{ label: string; description: string }>
  prize: string
  prizeItems: PrizeItem[]
}

interface PointsPrizeSection {
  heading: string
  intro: string
  rules: PrizeRules
}

export function Terms() {
  const { t } = useTranslation('legal')

  const toc = t('terms.toc.items', { returnObjects: true }) as TocItem[]
  const membership = t('terms.sections.membership', { returnObjects: true }) as TextSection
  const eventsPhysicalRisk = t('terms.sections.eventsPhysicalRisk', { returnObjects: true }) as TextSection
  const conduct = t('terms.sections.conduct', { returnObjects: true }) as ConductSection
  const pointsPrize = t('terms.sections.pointsPrize', { returnObjects: true }) as PointsPrizeSection
  const donations = t('terms.sections.donations', { returnObjects: true }) as TextSection
  const changes = t('terms.sections.changes', { returnObjects: true }) as TextSection

  return (
    <>
      <DraftBanner />

      <div className="flex flex-col gap-8 px-4 py-12 sm:px-6 md:gap-16 md:py-16 lg:px-8">
        <Container className="md:flex md:gap-12">
          {/* Table of Contents - sticky on desktop */}
          <TableOfContents items={toc} title={t('terms.toc.title')} />

          {/* Main content */}
          <article className="flex-1 min-w-0">
            <header className="mb-8">
              <h1 className="font-display text-3xl font-bold leading-tight text-karma-ink md:text-4xl">
                {t('terms.pageTitle')}
              </h1>
              <p className="mt-2 text-sm text-karma-ink-soft">
                {t('terms.lastUpdated')}
              </p>
            </header>

            <p className="mb-8 text-lg leading-relaxed text-karma-ink">
              {t('terms.intro')}
            </p>

            {/* Membership */}
            <section id="membership" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {membership.heading}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-karma-ink">
                {membership.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Events & Physical Risk */}
            <section id="events" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {eventsPhysicalRisk.heading}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-karma-ink">
                {eventsPhysicalRisk.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Code of Conduct */}
            <section id="conduct" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {conduct.heading}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-karma-ink">
                {conduct.intro}
              </p>
              <ul className="mt-6 space-y-4">
                {conduct.items.map((item, idx) => (
                  <li key={idx} className="border-l-2 border-karma-tan-dark pl-4">
                    <dt className="font-semibold text-karma-ink">{item.label}</dt>
                    <dd className="mt-1 text-karma-ink-soft">{item.description}</dd>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-base leading-relaxed text-karma-ink">
                {conduct.enforcement}
              </p>
            </section>

            {/* Points & Prize */}
            <section id="points-prize" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {pointsPrize.heading}
              </h2>
              <div className="mt-4 rounded-lg bg-karma-red-soft p-4 text-sm text-karma-ink">
                {pointsPrize.intro}
              </div>

              <div className="mt-8">
                <h3 className="font-display text-lg font-semibold text-karma-ink">
                  {pointsPrize.rules.earning}
                </h3>
                <ul className="mt-4 space-y-3">
                  {pointsPrize.rules.earningItems.map((item, idx) => (
                    <li key={idx} className="border-l-2 border-karma-tan-dark pl-4">
                      <dt className="font-semibold text-karma-ink">{item.label}</dt>
                      <dd className="mt-1 text-karma-ink-soft">{item.description}</dd>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="font-display text-lg font-semibold text-karma-ink">
                  {pointsPrize.rules.prize}
                </h3>
                <ul className="mt-4 space-y-3">
                  {(pointsPrize.rules.prizeItems as PrizeItem[]).map((item, idx) => (
                    <li key={idx} className="border-l-2 border-karma-tan-dark pl-4">
                      <dt className="font-semibold text-karma-ink">{item.label}</dt>
                      <dd className="mt-1 text-karma-ink-soft">{item.description}</dd>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Donations */}
            <section id="donations" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {donations.heading}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-karma-ink">
                {donations.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Changes */}
            <section id="changes" className="mb-12 scroll-mt-32">
              <h2 className="font-display text-2xl font-bold text-karma-ink md:text-3xl">
                {changes.heading}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-karma-ink">
                {changes.content.split('\n\n').map((paragraph, idx) => (
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
