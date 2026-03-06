import { type FormEvent } from 'react'
import type { LookupItem } from '../services/propertyService'

export type PropertyFilterState = {
  searchTerm: string
  cityId: string
  areaId: string
  listingType: string
  propertyType: string
  minPrice: string
  maxPrice: string
  minBedrooms: string
  maxBedrooms: string
  minBathrooms: string
  maxBathrooms: string
  minSquareMeters: string
  maxSquareMeters: string
  sortBy: string
}

type SearchFiltersProps = {
  filters: PropertyFilterState
  cities: LookupItem[]
  areas: LookupItem[]
  onChange: (name: keyof PropertyFilterState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
}

function SearchFilters({ filters, cities, areas, onChange, onSubmit, onClear }: SearchFiltersProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input
          value={filters.searchTerm}
          onChange={(e) => onChange('searchTerm', e.target.value)}
          placeholder="Keyword"
          className="rounded border px-3 py-2"
        />
        <select value={filters.cityId} onChange={(e) => onChange('cityId', e.target.value)} className="rounded border px-3 py-2">
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        <select value={filters.areaId} onChange={(e) => onChange('areaId', e.target.value)} className="rounded border px-3 py-2">
          <option value="">All Areas</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
        <select value={filters.listingType} onChange={(e) => onChange('listingType', e.target.value)} className="rounded border px-3 py-2">
          <option value="">Any Listing Type</option>
          <option value="1">Sale</option>
          <option value="2">Rent</option>
        </select>
        <select value={filters.propertyType} onChange={(e) => onChange('propertyType', e.target.value)} className="rounded border px-3 py-2">
          <option value="">Any Property Type</option>
          <option value="1">Apartment</option>
          <option value="2">House</option>
          <option value="3">Maisonette</option>
          <option value="4">Studio</option>
          <option value="5">Land</option>
          <option value="6">Commercial</option>
        </select>
        <input value={filters.minPrice} onChange={(e) => onChange('minPrice', e.target.value)} placeholder="Min Price" className="rounded border px-3 py-2" />
        <input value={filters.maxPrice} onChange={(e) => onChange('maxPrice', e.target.value)} placeholder="Max Price" className="rounded border px-3 py-2" />
        <input value={filters.minBedrooms} onChange={(e) => onChange('minBedrooms', e.target.value)} placeholder="Min Bedrooms" className="rounded border px-3 py-2" />
        <input value={filters.maxBedrooms} onChange={(e) => onChange('maxBedrooms', e.target.value)} placeholder="Max Bedrooms" className="rounded border px-3 py-2" />
        <input value={filters.minBathrooms} onChange={(e) => onChange('minBathrooms', e.target.value)} placeholder="Min Bathrooms" className="rounded border px-3 py-2" />
        <input value={filters.maxBathrooms} onChange={(e) => onChange('maxBathrooms', e.target.value)} placeholder="Max Bathrooms" className="rounded border px-3 py-2" />
        <input
          value={filters.minSquareMeters}
          onChange={(e) => onChange('minSquareMeters', e.target.value)}
          placeholder="Min Sqm"
          className="rounded border px-3 py-2"
        />
        <input
          value={filters.maxSquareMeters}
          onChange={(e) => onChange('maxSquareMeters', e.target.value)}
          placeholder="Max Sqm"
          className="rounded border px-3 py-2"
        />
        <select value={filters.sortBy} onChange={(e) => onChange('sortBy', e.target.value)} className="rounded border px-3 py-2">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="priceAsc">Price Low to High</option>
          <option value="priceDesc">Price High to Low</option>
        </select>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">
          Apply
        </button>
        <button type="button" onClick={onClear} className="rounded border px-4 py-2">
          Clear
        </button>
      </div>
    </form>
  )
}

export default SearchFilters
