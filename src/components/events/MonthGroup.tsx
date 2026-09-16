import type { KarmaEvent } from '@/data/events'
import { EventCard } from './EventCard'

interface MonthGroupProps {
  label: string
  events: KarmaEvent[]
}

export function MonthGroup({ label, events }: MonthGroupProps) {
  return (
    <section aria-label={label}>
      <h2 className="sticky top-16 z-10 -mx-4 border-b border-karma-tan-dark/20 bg-karma-cream/95 px-4 py-2 font-display text-sm font-bold uppercase tracking-widest text-karma-ink-soft backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {label}
      </h2>
      <ul className="grid gap-4 py-4 sm:grid-cols-2">
        {events.map((event) => (
          <EventCard key={event.slug} event={event} />
        ))}
      </ul>
    </section>
  )
}
