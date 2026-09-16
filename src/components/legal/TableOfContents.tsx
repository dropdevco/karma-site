import { cn } from '@/lib/cn'

interface TocItem {
  id: string
  label: string
}

interface TableOfContentsProps {
  items: TocItem[]
  title: string
}

export function TableOfContents({ items, title }: TableOfContentsProps) {
  return (
    <nav
      className={cn(
        'hidden md:block',
        'sticky top-[120px] h-fit w-64 shrink-0 pr-8 text-sm',
      )}
      aria-label="Table of contents"
    >
      <h2 className="font-display font-semibold text-karma-ink">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-karma-ink-soft transition-colors hover:text-karma-red"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
