const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function isValidSlug(value: string): boolean {
  return value.length > 0 && value.length <= 100 && SLUG_PATTERN.test(value)
}

/** Best-effort slug from a title: lowercase, strip accents, hyphenate. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}
