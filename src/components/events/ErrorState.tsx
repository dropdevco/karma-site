import { Button } from '@/components/ui/Button'

interface ErrorStateProps {
  title: string
  body: string
  retryLabel: string
  onRetry: () => void
}

export function ErrorState({ title, body, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-card border border-dashed border-karma-red/40 bg-karma-red-soft/30 px-6 py-16 text-center"
    >
      <p className="font-display text-2xl font-bold text-karma-ink">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-karma-ink-soft">{body}</p>
      <Button type="button" variant="secondary" className="mt-6" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  )
}
