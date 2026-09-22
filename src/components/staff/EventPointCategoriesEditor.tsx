import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { BilingualPair } from '@/components/staff/BilingualPair'
import { StaffTextField } from '@/components/staff/StaffTextField'
import { supabase, isOffline } from '@/lib/supabase'
import type { EventPointCategoryRow } from '@/lib/database.types'

interface EventPointCategoriesEditorProps {
  eventId: string
}

type LoadState = 'loading' | 'error' | 'offline' | 'ready'

interface CategoryFormValues {
  label_en: string
  label_es: string
  points: string
}

type CategoryFormErrors = Partial<Record<keyof CategoryFormValues, string>>

const EMPTY_FORM: CategoryFormValues = { label_en: '', label_es: '', points: '' }

function isPermissionError(error: { code?: string; message?: string }): boolean {
  if (error.code === '42501') return true
  const message = error.message?.toLowerCase() ?? ''
  return message.includes('row-level security') || message.includes('permission denied')
}

export function EventPointCategoriesEditor({ eventId }: EventPointCategoriesEditorProps) {
  const { t } = useTranslation('staff')

  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [categories, setCategories] = useState<EventPointCategoryRow[]>([])

  const [addValues, setAddValues] = useState<CategoryFormValues>(EMPTY_FORM)
  const [addErrors, setAddErrors] = useState<CategoryFormErrors>({})
  const [addAttempted, setAddAttempted] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addFailure, setAddFailure] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<CategoryFormValues>(EMPTY_FORM)
  const [editErrors, setEditErrors] = useState<CategoryFormErrors>({})
  const [editAttempted, setEditAttempted] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editFailure, setEditFailure] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteFailure, setDeleteFailure] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoadState('loading')
      const { data, error } = await supabase
        .from('event_point_categories')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order')
      if (cancelled) return
      if (error) {
        setLoadState(isOffline(error) ? 'offline' : 'error')
        return
      }
      setCategories(data ?? [])
      setLoadState('ready')
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [eventId])

  function validate(values: CategoryFormValues): CategoryFormErrors {
    const errors: CategoryFormErrors = {}
    const en = values.label_en.trim()
    const es = values.label_es.trim()

    if (!en) errors.label_en = t('pointCategories.errors.required')
    else if (en.length > 120) errors.label_en = t('pointCategories.errors.labelTooLong')

    if (!es) errors.label_es = t('pointCategories.errors.required')
    else if (es.length > 120) errors.label_es = t('pointCategories.errors.labelTooLong')

    const pointsNumber = Number(values.points)
    if (!values.points.trim()) {
      errors.points = t('pointCategories.errors.required')
    } else if (!Number.isInteger(pointsNumber) || pointsNumber < 1 || pointsNumber > 10000) {
      errors.points = t('pointCategories.errors.pointsRange')
    }

    return errors
  }

  function updateAddValue(key: keyof CategoryFormValues, value: string) {
    setAddValues((prev) => {
      const next = { ...prev, [key]: value }
      setAddErrors(validate(next))
      return next
    })
  }

  function updateEditValue(key: keyof CategoryFormValues, value: string) {
    setEditValues((prev) => {
      const next = { ...prev, [key]: value }
      setEditErrors(validate(next))
      return next
    })
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (adding) return

    setAddAttempted(true)
    const nextErrors = validate(addValues)
    setAddErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setAdding(true)
    setAddFailure(null)
    try {
      const { data, error } = await supabase
        .from('event_point_categories')
        .insert({
          event_id: eventId,
          label_en: addValues.label_en.trim(),
          label_es: addValues.label_es.trim(),
          points: Number(addValues.points),
          sort_order: categories.length,
        })
        .select()
        .single()

      if (error) {
        setAddFailure(
          isPermissionError(error) ? t('pointCategories.errors.permission') : t('pointCategories.errors.saveFailed'),
        )
        return
      }

      if (data) {
        setCategories((prev) => [...prev, data])
      }
      setAddValues(EMPTY_FORM)
      setAddErrors({})
      setAddAttempted(false)
    } catch (error) {
      setAddFailure(isOffline(error) ? t('pointCategories.errors.offline') : t('pointCategories.errors.saveFailed'))
    } finally {
      setAdding(false)
    }
  }

  function startEdit(category: EventPointCategoryRow) {
    setEditingId(category.id)
    setEditValues({ label_en: category.label_en, label_es: category.label_es, points: String(category.points) })
    setEditErrors({})
    setEditAttempted(false)
    setEditFailure(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValues(EMPTY_FORM)
    setEditErrors({})
    setEditAttempted(false)
    setEditFailure(null)
  }

  async function handleEditSave(event: FormEvent<HTMLFormElement>, category: EventPointCategoryRow) {
    event.preventDefault()
    if (savingEdit) return

    setEditAttempted(true)
    const nextErrors = validate(editValues)
    setEditErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSavingEdit(true)
    setEditFailure(null)
    try {
      const { data, error } = await supabase
        .from('event_point_categories')
        .update({
          label_en: editValues.label_en.trim(),
          label_es: editValues.label_es.trim(),
          points: Number(editValues.points),
        })
        .eq('id', category.id)
        .select()
        .single()

      if (error) {
        setEditFailure(
          isPermissionError(error) ? t('pointCategories.errors.permission') : t('pointCategories.errors.saveFailed'),
        )
        return
      }

      if (data) {
        setCategories((prev) => prev.map((existing) => (existing.id === category.id ? data : existing)))
      }
      cancelEdit()
    } catch (error) {
      setEditFailure(isOffline(error) ? t('pointCategories.errors.offline') : t('pointCategories.errors.saveFailed'))
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete(category: EventPointCategoryRow) {
    if (deletingId) return
    if (!window.confirm(t('pointCategories.edit.deleteConfirm'))) return

    setDeletingId(category.id)
    setDeleteFailure(null)
    try {
      const { error } = await supabase.from('event_point_categories').delete().eq('id', category.id)
      if (error) {
        setDeleteFailure(
          isPermissionError(error) ? t('pointCategories.errors.permission') : t('pointCategories.errors.deleteFailed'),
        )
        return
      }
      setCategories((prev) => prev.filter((existing) => existing.id !== category.id))
      if (editingId === category.id) cancelEdit()
    } catch (error) {
      setDeleteFailure(isOffline(error) ? t('pointCategories.errors.offline') : t('pointCategories.errors.deleteFailed'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-card border border-karma-tan-dark/25 bg-white p-5">
      <div>
        <h2 className="font-display text-base font-bold text-karma-ink">{t('pointCategories.heading')}</h2>
        <p className="mt-1 text-sm text-karma-ink-soft">{t('pointCategories.intro')}</p>
      </div>

      {loadState === 'loading' && (
        <p aria-busy="true" className="text-sm text-karma-ink-soft">
          {t('pointCategories.loading')}
        </p>
      )}

      {loadState === 'offline' && (
        <p role="alert" className="text-sm font-medium text-karma-red">
          {t('pointCategories.errors.offline')}
        </p>
      )}

      {loadState === 'error' && (
        <p role="alert" className="text-sm font-medium text-karma-red">
          {t('pointCategories.errors.loadFailed')}
        </p>
      )}

      {loadState === 'ready' && (
        <>
          {categories.length === 0 && <p className="text-sm text-karma-ink-soft">{t('pointCategories.empty')}</p>}

          {categories.length > 0 && (
            <ul className="flex flex-col gap-3">
              {categories.map((category) => (
                <li key={category.id} className="rounded-xl border border-karma-tan-dark/25 p-4">
                  {editingId === category.id ? (
                    <form onSubmit={(event) => void handleEditSave(event, category)} className="flex flex-col gap-4">
                      <BilingualPair legend={t('pointCategories.edit.legend')}>
                        <StaffTextField
                          id={`edit-label-en-${category.id}`}
                          label={t('pointCategories.add.labelEn')}
                          required
                          value={editValues.label_en}
                          onChange={(value) => updateEditValue('label_en', value)}
                          error={editAttempted ? editErrors.label_en : undefined}
                        />
                        <StaffTextField
                          id={`edit-label-es-${category.id}`}
                          label={t('pointCategories.add.labelEs')}
                          required
                          value={editValues.label_es}
                          onChange={(value) => updateEditValue('label_es', value)}
                          error={editAttempted ? editErrors.label_es : undefined}
                        />
                      </BilingualPair>
                      <div className="sm:w-40">
                        <StaffTextField
                          id={`edit-points-${category.id}`}
                          label={t('pointCategories.add.points')}
                          required
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={10000}
                          value={editValues.points}
                          onChange={(value) => updateEditValue('points', value)}
                          error={editAttempted ? editErrors.points : undefined}
                        />
                      </div>
                      {editFailure && (
                        <p role="alert" className="text-sm font-medium text-karma-red">
                          {editFailure}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <Button type="submit" variant="primary" size="sm" disabled={savingEdit}>
                          {savingEdit ? t('pointCategories.edit.saving') : t('pointCategories.edit.save')}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={cancelEdit} disabled={savingEdit}>
                          {t('pointCategories.edit.cancel')}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-sm font-semibold text-karma-ink">
                          {category.label_en} <span className="font-normal text-karma-ink-soft">/ {category.label_es}</span>
                        </p>
                        <p className="text-sm text-karma-ink-soft">
                          {t('pointCategories.list.pointsLabel', { points: category.points })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(category)}>
                          {t('pointCategories.edit.editCta')}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === category.id}
                          onClick={() => void handleDelete(category)}
                        >
                          {deletingId === category.id ? t('pointCategories.edit.deleting') : t('pointCategories.edit.deleteCta')}
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {deleteFailure && (
            <p role="alert" className="text-sm font-medium text-karma-red">
              {deleteFailure}
            </p>
          )}

          <form onSubmit={(event) => void handleAdd(event)} className="flex flex-col gap-4 border-t border-karma-tan-dark/20 pt-5">
            <BilingualPair legend={t('pointCategories.add.legend')}>
              <StaffTextField
                id="new-category-label-en"
                label={t('pointCategories.add.labelEn')}
                required
                value={addValues.label_en}
                onChange={(value) => updateAddValue('label_en', value)}
                error={addAttempted ? addErrors.label_en : undefined}
              />
              <StaffTextField
                id="new-category-label-es"
                label={t('pointCategories.add.labelEs')}
                required
                value={addValues.label_es}
                onChange={(value) => updateAddValue('label_es', value)}
                error={addAttempted ? addErrors.label_es : undefined}
              />
            </BilingualPair>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="sm:w-40">
                <StaffTextField
                  id="new-category-points"
                  label={t('pointCategories.add.points')}
                  required
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10000}
                  value={addValues.points}
                  onChange={(value) => updateAddValue('points', value)}
                  error={addAttempted ? addErrors.points : undefined}
                />
              </div>
              <Button type="submit" variant="primary" size="md" disabled={adding}>
                {adding ? t('pointCategories.add.submitting') : t('pointCategories.add.submit')}
              </Button>
            </div>
            {addFailure && (
              <p role="alert" className="text-sm font-medium text-karma-red">
                {addFailure}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  )
}
