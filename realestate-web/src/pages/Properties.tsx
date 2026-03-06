import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import PropertyCard from '../components/PropertyCard'
import SearchFilters, { type PropertyFilterState } from '../components/SearchFilters'
import useAuthState from '../hooks/useAuthState'
import { getMyFavorites } from '../services/favoritesService'
import { getAreas, getCities, getProperties, type LookupItem, type PropertyListItemResponse } from '../services/propertyService'

const defaultFilters: PropertyFilterState = {
  searchTerm: '',
  cityId: '',
  areaId: '',
  listingType: '',
  propertyType: '',
  minPrice: '',
  maxPrice: '',
  minBedrooms: '',
  maxBedrooms: '',
  minBathrooms: '',
  maxBathrooms: '',
  minSquareMeters: '',
  maxSquareMeters: '',
  sortBy: 'newest',
}

function Properties() {
  const { isAuthenticated } = useAuthState()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<PropertyFilterState>(defaultFilters)
  const [items, setItems] = useState<PropertyListItemResponse[]>([])
  const [cities, setCities] = useState<LookupItem[]>([])
  const [areas, setAreas] = useState<LookupItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    const next = { ...defaultFilters }
    for (const key of Object.keys(next) as (keyof PropertyFilterState)[]) {
      const value = searchParams.get(key)
      if (value) {
        next[key] = value
      }
    }

    setFilters(next)
    const pageParam = Number(searchParams.get('page') || '1')
    setPage(pageParam > 0 ? pageParam : 1)
  }, [searchParams])

  useEffect(() => {
    void (async () => {
      const data = await getCities()
      setCities(data)
    })()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set())
      return
    }

    void (async () => {
      try {
        const favorites = await getMyFavorites()
        setFavoriteIds(new Set(favorites.map((x) => x.propertyId)))
      } catch {
        setFavoriteIds(new Set())
      }
    })()
  }, [isAuthenticated])

  useEffect(() => {
    void (async () => {
      const selectedCity = Number(filters.cityId)
      const data = await getAreas(Number.isFinite(selectedCity) && selectedCity > 0 ? selectedCity : undefined)
      setAreas(data)
    })()
  }, [filters.cityId])

  const query = useMemo(() => {
    const toNum = (value: string) => {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : undefined
    }

    return {
      searchTerm: filters.searchTerm || undefined,
      cityId: toNum(filters.cityId),
      areaId: toNum(filters.areaId),
      listingType: toNum(filters.listingType),
      propertyType: toNum(filters.propertyType),
      minPrice: toNum(filters.minPrice),
      maxPrice: toNum(filters.maxPrice),
      minBedrooms: toNum(filters.minBedrooms),
      maxBedrooms: toNum(filters.maxBedrooms),
      minBathrooms: toNum(filters.minBathrooms),
      maxBathrooms: toNum(filters.maxBathrooms),
      minSquareMeters: toNum(filters.minSquareMeters),
      maxSquareMeters: toNum(filters.maxSquareMeters),
      sortBy: filters.sortBy as 'newest' | 'oldest' | 'priceAsc' | 'priceDesc',
      page,
      pageSize: 12,
    }
  }, [filters, page])

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const response = await getProperties(query)
        setItems(response.items)
        setTotalPages(response.totalPages || 1)
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Failed to load properties.')
      } finally {
        setLoading(false)
      }
    })()
  }, [query])

  const setFilterField = (name: keyof PropertyFilterState, value: string) => {
    setFilters((prev) => {
      if (name === 'cityId') {
        return { ...prev, cityId: value, areaId: '' }
      }
      return { ...prev, [name]: value }
    })
  }

  const applySearchParams = (nextPage: number) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        params.set(key, value)
      }
    }
    params.set('page', String(nextPage))
    setSearchParams(params)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    applySearchParams(1)
  }

  const onClear = () => {
    setFilters(defaultFilters)
    setSearchParams(new URLSearchParams({ page: '1' }))
  }

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return
    }
    applySearchParams(nextPage)
  }

  const onFavoriteChanged = (propertyId: number, isFavorited: boolean) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (isFavorited) {
        next.add(propertyId)
      } else {
        next.delete(propertyId)
      }
      return next
    })
  }

  return (
    <section>
      <PageTitle title="Properties" />
      <div className="mt-6 space-y-6">
        <SearchFilters filters={filters} cities={cities} areas={areas} onChange={setFilterField} onSubmit={onSubmit} onClear={onClear} />

        {loading && <p className="text-slate-600">Loading properties...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="text-slate-600">No properties match your filters.</p>}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorited={favoriteIds.has(property.id)}
                  onFavoriteChanged={(isFavorited) => onFavoriteChanged(property.id, isFavorited)}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button className="rounded border px-3 py-1 disabled:opacity-40" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
                Previous
              </button>
              <span className="text-sm text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button className="rounded border px-3 py-1 disabled:opacity-40" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Properties
