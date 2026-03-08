import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import PropertyCard from '../components/PropertyCard'
import PropertiesMap, { type MapBoundsFilter } from '../components/PropertiesMap'
import SearchFilters, { type PropertyFilterState } from '../components/SearchFilters'
import Button from '../components/ui/Button'
import useAuthState from '../hooks/useAuthState'
import { getMyFavorites } from '../services/favoritesService'
import { getAreas, getCities, getProperties, type LookupItem, type PropertyListItemResponse } from '../services/propertyService'
import { deleteSavedSearch, getSavedSearches, saveSearch, type SavedSearch } from '../services/savedSearchService'

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
  const [appliedFilters, setAppliedFilters] = useState<PropertyFilterState>(defaultFilters)
  const [items, setItems] = useState<PropertyListItemResponse[]>([])
  const [cities, setCities] = useState<LookupItem[]>([])
  const [areas, setAreas] = useState<LookupItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [mapBounds, setMapBounds] = useState<MapBoundsFilter | null>(null)
  const [appliedMapBounds, setAppliedMapBounds] = useState<MapBoundsFilter | null>(null)
  const [savedSearches, setSavedSearches] = useState<SavedSearch<PropertyFilterState>[]>([])
  const [saveSearchName, setSaveSearchName] = useState('')
  const [savedSearchId, setSavedSearchId] = useState('')

  useEffect(() => {
    const next = { ...defaultFilters }
    for (const key of Object.keys(next) as (keyof PropertyFilterState)[]) {
      const value = searchParams.get(key)
      if (value) {
        next[key] = value
      }
    }

    setFilters(next)
    setAppliedFilters(next)
    const pageParam = Number(searchParams.get('page') || '1')
    setPage(pageParam > 0 ? pageParam : 1)
  }, [searchParams])

  useEffect(() => {
    void (async () => {
      try {
        const data = await getCities()
        setCities(data)
      } catch {
        setCities([])
      }
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
    setSavedSearches(getSavedSearches<PropertyFilterState>())
  }, [])

  useEffect(() => {
    void (async () => {
      const selectedCity = Number(filters.cityId)
      try {
        const data = await getAreas(Number.isFinite(selectedCity) && selectedCity > 0 ? selectedCity : undefined)
        setAreas(data)
      } catch {
        setAreas([])
      }
    })()
  }, [filters.cityId])

  const query = useMemo(() => {
    const toNum = (value: string) => {
      if (value.trim() === '') {
        return undefined
      }
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : undefined
    }
    const toPositiveInt = (value: string) => {
      const parsed = toNum(value)
      return parsed && parsed > 0 ? parsed : undefined
    }

    return {
      searchTerm: appliedFilters.searchTerm || undefined,
      cityId: toPositiveInt(appliedFilters.cityId),
      areaId: toPositiveInt(appliedFilters.areaId),
      listingType: toPositiveInt(appliedFilters.listingType),
      propertyType: toPositiveInt(appliedFilters.propertyType),
      minPrice: toNum(appliedFilters.minPrice),
      maxPrice: toNum(appliedFilters.maxPrice),
      minBedrooms: toNum(appliedFilters.minBedrooms),
      maxBedrooms: toNum(appliedFilters.maxBedrooms),
      minBathrooms: toNum(appliedFilters.minBathrooms),
      maxBathrooms: toNum(appliedFilters.maxBathrooms),
      minSquareMeters: toNum(appliedFilters.minSquareMeters),
      maxSquareMeters: toNum(appliedFilters.maxSquareMeters),
      minLatitude: appliedMapBounds?.minLatitude,
      maxLatitude: appliedMapBounds?.maxLatitude,
      minLongitude: appliedMapBounds?.minLongitude,
      maxLongitude: appliedMapBounds?.maxLongitude,
      sortBy: appliedFilters.sortBy as 'newest' | 'oldest' | 'priceAsc' | 'priceDesc',
      page,
      pageSize: 12,
    }
  }, [appliedFilters, appliedMapBounds, page])

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const response = await getProperties(query)
        setItems(response.items)
        setTotalPages(response.totalPages || 1)
      } catch (err: any) {
        const responseMessage = err?.response?.data?.message
        const validationErrors = err?.response?.data?.errors
        if (validationErrors) {
          const messages = Object.values(validationErrors)
            .flatMap((x) => (Array.isArray(x) ? x : [String(x)]))
            .filter(Boolean)
          setError(messages.length > 0 ? messages.join(' | ') : 'Failed to load properties.')
        } else {
          setError(responseMessage ?? 'Failed to load properties.')
        }
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
    setAppliedMapBounds(null)
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

  const selectFromMap = (propertyId: number) => {
    setSelectedPropertyId(propertyId)
    const card = document.getElementById(`property-card-${propertyId}`)
    card?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const onSaveSearch = () => {
    if (!saveSearchName.trim()) {
      return
    }

    saveSearch(saveSearchName, filters)
    setSavedSearches(getSavedSearches<PropertyFilterState>())
    setSaveSearchName('')
  }

  const applySavedSearch = (id: string) => {
    setSavedSearchId(id)
    const match = savedSearches.find((x) => x.id === id)
    if (!match) {
      return
    }

    setFilters(match.filters)
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(match.filters)) {
      if (value) {
        params.set(key, value)
      }
    }
    params.set('page', '1')
    setSearchParams(params)
  }

  const removeSavedSearch = () => {
    if (!savedSearchId) {
      return
    }

    deleteSavedSearch<PropertyFilterState>(savedSearchId)
    const next = getSavedSearches<PropertyFilterState>()
    setSavedSearches(next)
    setSavedSearchId('')
  }

  const applyMapArea = () => {
    if (!mapBounds) {
      return
    }

    setAppliedMapBounds(mapBounds)
    applySearchParams(1)
  }

  const clearMapArea = () => {
    setAppliedMapBounds(null)
  }

  return (
    <section>
      <PageTitle
        title="Properties"
        subtitle="Explore verified listings with filters for location, budget, and home details."
      />
      <div className="mt-8 space-y-8">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
        >
          <div className="grid gap-3 lg:grid-cols-[1.3fr_repeat(5,minmax(0,1fr))]">
            <input
              value={filters.searchTerm}
              onChange={(e) => setFilterField('searchTerm', e.target.value)}
              placeholder="Search by keyword, city, address..."
              className="w-full rounded-xl border border-slate-700 bg-black px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            />
            <select
              value={filters.listingType}
              onChange={(e) => setFilterField('listingType', e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-black px-4 py-3 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            >
              <option value="">Any Listing Type</option>
              <option value="1">For Sale</option>
              <option value="2">For Rent</option>
            </select>
            <select
              value={filters.cityId}
              onChange={(e) => setFilterField('cityId', e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-black px-4 py-3 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            <select
              value={filters.propertyType}
              onChange={(e) => setFilterField('propertyType', e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-black px-4 py-3 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            >
              <option value="">Any Property Type</option>
              <option value="1">Apartment</option>
              <option value="2">House</option>
              <option value="3">Maisonette</option>
              <option value="4">Studio</option>
              <option value="5">Land</option>
              <option value="6">Commercial</option>
            </select>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilterField('sortBy', e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-black px-4 py-3 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="priceAsc">Price Low to High</option>
              <option value="priceDesc">Price High to Low</option>
            </select>
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="rounded-xl border border-slate-700 bg-black px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              {showAdvanced ? 'Hide Filters' : 'More Filters'}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="submit">Search</Button>
            <Button type="button" variant="secondary" onClick={onClear}>
              Clear
            </Button>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-[1.3fr_1fr_auto]">
            <input
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="Save current search as..."
              className="w-full rounded-xl border border-slate-700 bg-black px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            />
            <Button type="button" variant="secondary" onClick={onSaveSearch}>
              Save Search
            </Button>
            <div className="text-xs text-slate-400 self-center">{savedSearches.length} saved</div>
          </div>
          {savedSearches.length > 0 && (
            <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]">
              <select
                value={savedSearchId}
                onChange={(e) => applySavedSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-black px-4 py-3 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
              >
                <option value="">Load saved search...</option>
                {savedSearches.map((saved) => (
                  <option key={saved.id} value={saved.id}>
                    {saved.name}
                  </option>
                ))}
              </select>
              <Button type="button" variant="ghost" onClick={removeSavedSearch} disabled={!savedSearchId}>
                Delete Saved
              </Button>
            </div>
          )}
        </form>

        {showAdvanced && (
          <SearchFilters
            filters={filters}
            cities={cities}
            areas={areas}
            onChange={setFilterField}
            onSubmit={onSubmit}
            onClear={onClear}
          />
        )}

        {loading && <p className="text-slate-600 dark:text-slate-400">Loading properties...</p>}
        {error && <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-6 text-slate-600   dark:text-slate-400">
            No properties match your filters.
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">{items.length} results on this page</p>
            </div>
            <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
              <div className="space-y-4">
                {items.map((property) => (
                  <div
                    key={property.id}
                    id={`property-card-${property.id}`}
                    className={selectedPropertyId === property.id ? 'rounded-2xl ring-2 ring-sky-500/50' : undefined}
                  >
                    <PropertyCard
                      property={property}
                      isFavorited={favoriteIds.has(property.id)}
                      onFavoriteChanged={(isFavorited) => onFavoriteChanged(property.id, isFavorited)}
                    />
                  </div>
                ))}
              </div>
              <div className="xl:sticky xl:top-24 xl:self-start">
                <PropertiesMap
                  items={items}
                  selectedId={selectedPropertyId}
                  onSelect={selectFromMap}
                  onBoundsChange={setMapBounds}
                  onSearchArea={applyMapArea}
                  onClearArea={clearMapArea}
                  hasAreaFilter={Boolean(appliedMapBounds)}
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="secondary" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
                Previous
              </Button>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Page {page} of {totalPages}
              </span>
              <Button variant="secondary" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Properties

