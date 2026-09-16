import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'

export function NotFound() {
  const { t } = useTranslation('legal')

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24 sm:px-6 md:py-32">
      <Container>
        <div className="mx-auto max-w-md text-center">
          <p
            className="font-display text-[5rem] font-black leading-none tracking-tighter text-karma-tan md:text-[7rem]"
            aria-hidden="true"
          >
            404
          </p>

          <h1 className="mt-6 font-display text-3xl font-bold text-karma-ink md:text-4xl">
            {t('notFound.heading')}
          </h1>

          <p className="mt-4 text-lg text-karma-ink-soft">
            {t('notFound.message')}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <ButtonLink to="/" variant="primary" size="md">
              {t('notFound.homeLink')}
            </ButtonLink>
            <ButtonLink to="/events" variant="secondary" size="md">
              {t('notFound.eventsLink')}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </div>
  )
}
