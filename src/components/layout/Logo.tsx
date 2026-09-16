import { cn } from '@/lib/cn'

// Placeholder wordmark. Drop the real files at public/brand/karma-wordmark.svg
// and public/brand/karma-mark.svg, then swap this for an <img>.
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'font-display text-2xl font-extrabold uppercase tracking-[0.12em] text-karma-red',
        className,
      )}
    >
      Karma
      <span className="text-karma-tan-dark">.</span>
    </span>
  )
}
