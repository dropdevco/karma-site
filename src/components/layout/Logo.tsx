import { cn } from '@/lib/cn'

type LogoProps = {
  variant?: 'wordmark' | 'mark'
  className?: string
}

// Intrinsic dimensions of the source art, passed through so the header
// reserves space instead of shifting once the image decodes.
const ART = {
  wordmark: { base: 'karma-wordmark', w: 360, h: 114, size: 'h-10' },
  mark: { base: 'karma-mark', w: 256, h: 314, size: 'h-12' },
} as const

export function Logo({ variant = 'wordmark', className }: LogoProps) {
  const { base, w, h, size } = ART[variant]
  const set = (ext: string) => `/brand/${base}-${w}.${ext} 1x, /brand/${base}-${w * 2}.${ext} 2x`

  return (
    <picture>
      <source type="image/webp" srcSet={set('webp')} />
      <img
        src={`/brand/${base}-${w}.png`}
        srcSet={set('png')}
        width={w}
        height={h}
        alt="Karma"
        decoding="async"
        className={cn('w-auto', size, className)}
      />
    </picture>
  )
}
