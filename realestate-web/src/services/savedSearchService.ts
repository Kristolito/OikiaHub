export type SavedSearch<TFilters> = {
  id: string
  name: string
  createdAt: string
  filters: TFilters
}

const SAVED_SEARCHES_KEY = 'oikiahub_saved_searches'
const MAX_SAVED_SEARCHES = 20

export function getSavedSearches<TFilters>(): SavedSearch<TFilters>[] {
  const raw = localStorage.getItem(SAVED_SEARCHES_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as SavedSearch<TFilters>[]
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
  } catch {
    return []
  }
}

export function saveSearch<TFilters>(name: string, filters: TFilters) {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return
  }

  const current = getSavedSearches<TFilters>()
  const next: SavedSearch<TFilters>[] = [
    {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      createdAt: new Date().toISOString(),
      filters,
    },
    ...current,
  ].slice(0, MAX_SAVED_SEARCHES)

  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(next))
}

export function deleteSavedSearch<TFilters>(id: string) {
  const current = getSavedSearches<TFilters>()
  const next = current.filter((x) => x.id !== id)
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(next))
}
