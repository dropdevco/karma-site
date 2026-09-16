import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export function Section({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('px-4 py-16 sm:px-6 md:py-24 lg:px-8', className)} {...props} />
}

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full max-w-6xl', className)} {...props} />
}

export function Eyebrow({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'font-display text-sm font-bold uppercase tracking-[0.2em] text-karma-red',
        className,
      )}
      {...props}
    />
  )
}
