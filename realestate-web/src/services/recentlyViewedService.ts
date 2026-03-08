const RECENTLY_VIEWED_KEY = 'oikiahub_recently_viewed'
const MAX_RECENTLY_VIEWED = 8

export type RecentlyViewedItem = {
  id: number
  title: string
  price: number
  city: string
  area: string
  bedrooms: number
  bathrooms: number
  squareMeters: number
  listingType: number
  primaryImageUrl?: string | null
  viewedAt: string
}

function readItems(): RecentlyViewedItem[] {
  const raw = localStorage.getItem(RECENTLY_VIEWED_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as RecentlyViewedItem[]
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
  } catch {
    return []
  }
}

function writeItems(items: RecentlyViewedItem[]) {
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items.slice(0, MAX_RECENTLY_VIEWED)))
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  return readItems()
}

export function addRecentlyViewed(item: Omit<RecentlyViewedItem, 'viewedAt'>) {
  const now = new Date().toISOString()
  const current = readItems().filter((x) => x.id !== item.id)
  const next: RecentlyViewedItem[] = [{ ...item, viewedAt: now }, ...current]
  writeItems(next)
}
