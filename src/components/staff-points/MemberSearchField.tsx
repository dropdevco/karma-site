import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, isOffline } from '@/lib/supabase'
import type { MemberSearchResult } from '@/lib/database.types'
import { cn } from '@/lib/cn'

const SEARCH_DEBOUNCE_MS = 300

interface MemberSearchFieldProps {
  id: string
  selected: MemberSearchResult | null
  onSelect: (member: MemberSearchResult) => void
  onClear: () => void
  error?: string
}

export function MemberSearchField({ id, selected, onSelect, onClear, error }: MemberSearchFieldProps) {
  const { t } = useTranslation('staffPoints')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<MemberSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState<'offline' | 'generic' | null>(null)
  const requestIdRef = useRef(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || selected) return

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      requestIdRef.current += 1
      setLoading(false)
      setSearchError('offline')
      setResults([])
      return
    }

    setLoading(true)
    setSearchError(null)
    const requestId = ++requestIdRef.current

    const timeout = setTimeout(() => {
      void supabase
        .rpc('search_members', { p_query: query.trim() })
        .then(({ data, error: rpcError }) => {
          if (requestIdRef.current !== requestId) return
          setLoading(false)
          if (rpcError) {
            setSearchError(isOffline(rpcError) ? 'offline' : 'generic')
            setResults([])
            return
          }
          setResults(data ?? [])
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [query, open, selected])

  const errorId = error ? `${id}-error` : undefined
  const listboxId = `${id}-listbox`

  if (selected) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="font-display text-sm font-semibold text-karma-ink">{t('member.label')}</span>
        <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl border-2 border-karma-red bg-karma-red-soft px-4 py-2.5">
          <span className="font-display font-semibold text-karma-ink">{selected.full_name}</span>
          <button
            type="button"
            onClick={() => {
              onClear()
              setQuery('')
              setResults([])
            }}
            className="min-h-11 shrink-0 rounded-full px-3 text-sm font-bold text-karma-red underline-offset-2 hover:underline"
          >
            {t('member.change')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={id} className="font-display text-sm font-semibold text-karma-ink">
        {t('member.label')}
        <span className="text-karma-red" aria-hidden="true">
          {' '}
          *
        </span>
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        autoComplete="off"
        value={query}
        placeholder={t('member.placeholder')}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150)
        }}
        className={cn(
          'min-h-11 rounded-xl border border-karma-tan-dark/40 bg-white px-4 py-2.5 text-base text-karma-ink placeholder:text-karma-ink-soft/60 focus:border-karma-red focus:outline-none',
          error && 'border-karma-red',
        )}
      />
      {error && (
        <p id={errorId} className="text-sm font-medium text-karma-red">
          {error}
        </p>
      )}

      {open && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          onMouseDown={(event) => event.preventDefault()}
          className="absolute top-full z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-karma-tan-dark/40 bg-white shadow-lg"
        >
          {loading && <p className="px-4 py-3 text-sm text-karma-ink-soft">{t('member.searching')}</p>}
          {!loading && searchError === 'offline' && (
            <p className="px-4 py-3 text-sm text-karma-ink-soft">{t('member.offline')}</p>
          )}
          {!loading && searchError === 'generic' && (
            <p className="px-4 py-3 text-sm text-karma-ink-soft">{t('member.searchError')}</p>
          )}
          {!loading && !searchError && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-karma-ink-soft">{t('member.noResults')}</p>
          )}
          {!loading &&
            !searchError &&
            results.map((member) => (
              <button
                key={member.user_id}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => {
                  onSelect(member)
                  setOpen(false)
                }}
                className="block min-h-11 w-full px-4 py-2.5 text-left font-sans text-base text-karma-ink hover:bg-karma-tan-light"
              >
                {member.full_name}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
