import { cn } from '@/lib/cn'
import type { EventCategory } from '@/lib/eventsApi'

const BACKGROUND: Record<EventCategory, string> = {
  soccer: 'bg-karma-tan-light',
  basketball: 'bg-karma-red-soft',
  running: 'bg-karma-tan',
  volleyball: 'bg-karma-tan-light',
}

interface CategoryVisualProps {
  category: EventCategory
  className?: string
}

/**
 * CSS/SVG-only stand-in for event photography. No image assets exist yet —
 * swap the <svg> below for real photos per category once they're shot.
 */
export function CategoryVisual({ category, className }: CategoryVisualProps) {
  return (
    <div className={cn('relative overflow-hidden', BACKGROUND[category], className)} aria-hidden="true">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <g className="text-karma-red" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2" fill="none">
          {category === 'soccer' && (
            <>
              <circle cx="60" cy="60" r="28" />
              <path d="M60 34 L77 47 L71 67 L49 67 L43 47 Z" />
              <path d="M-10 105 L130 55" strokeOpacity="0.25" />
            </>
          )}
          {category === 'basketball' && (
            <>
              <circle cx="60" cy="60" r="30" />
              <path d="M60 30 V90 M30 60 H90" />
              <path d="M36 36 Q60 60 36 84" />
              <path d="M84 36 Q60 60 84 84" />
            </>
          )}
          {category === 'running' && (
            <>
              <path d="M8 92 L38 62 L58 82 L112 28" strokeWidth="3" strokeLinecap="round" />
              <path d="M14 72 L32 54" strokeLinecap="round" />
              <path d="M22 104 L50 76" strokeLinecap="round" />
            </>
          )}
          {category === 'volleyball' && (
            <>
              <circle cx="60" cy="42" r="22" />
              <path d="M8 100 H112 M8 100 V72 M112 100 V72 M8 86 H112" />
            </>
          )}
        </g>
      </svg>
    </div>
  )
}
