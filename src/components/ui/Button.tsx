import { Link } from 'react-router-dom'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-display font-semibold tracking-tight rounded-full transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'bg-karma-red text-white hover:bg-karma-red-dark',
  secondary:
    'bg-karma-tan-light text-karma-ink hover:bg-karma-tan border border-karma-tan-dark/30',
  ghost: 'text-karma-ink hover:bg-karma-tan-light',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-base px-6 py-3',
  lg: 'text-lg px-8 py-4',
}

type BaseProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: BaseProps & ComponentProps<'button'>) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  to,
  ...props
}: BaseProps & { to: string } & Omit<ComponentProps<typeof Link>, 'to'>) {
  return (
    <Link to={to} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  )
}
