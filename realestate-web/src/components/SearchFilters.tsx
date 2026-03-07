import { type FormEvent } from 'react'
import type { LookupItem } from '../services/propertyService'
import Button from './ui/Button'
import Card from './ui/Card'
import Input from './ui/Input'
import Select from './ui/Select'

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
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Find Your Next Home</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Refine by city, price range, size, and listing type.</p>
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input value={filters.searchTerm} onChange={(e) => onChange('searchTerm', e.target.value)} placeholder="Keyword" />

          <Select value={filters.cityId} onChange={(e) => onChange('cityId', e.target.value)}>
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </Select>

          <Select value={filters.areaId} onChange={(e) => onChange('areaId', e.target.value)}>
            <option value="">All Areas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </Select>

          <Select value={filters.listingType} onChange={(e) => onChange('listingType', e.target.value)}>
            <option value="">Any Listing Type</option>
            <option value="1">Sale</option>
            <option value="2">Rent</option>
          </Select>

          <Select value={filters.propertyType} onChange={(e) => onChange('propertyType', e.target.value)}>
            <option value="">Any Property Type</option>
            <option value="1">Apartment</option>
            <option value="2">House</option>
            <option value="3">Maisonette</option>
            <option value="4">Studio</option>
            <option value="5">Land</option>
            <option value="6">Commercial</option>
          </Select>

          <Input value={filters.minPrice} onChange={(e) => onChange('minPrice', e.target.value)} placeholder="Min Price" />
          <Input value={filters.maxPrice} onChange={(e) => onChange('maxPrice', e.target.value)} placeholder="Max Price" />
          <Input value={filters.minBedrooms} onChange={(e) => onChange('minBedrooms', e.target.value)} placeholder="Min Bedrooms" />
          <Input value={filters.maxBedrooms} onChange={(e) => onChange('maxBedrooms', e.target.value)} placeholder="Max Bedrooms" />
          <Input value={filters.minBathrooms} onChange={(e) => onChange('minBathrooms', e.target.value)} placeholder="Min Bathrooms" />
          <Input value={filters.maxBathrooms} onChange={(e) => onChange('maxBathrooms', e.target.value)} placeholder="Max Bathrooms" />
          <Input value={filters.minSquareMeters} onChange={(e) => onChange('minSquareMeters', e.target.value)} placeholder="Min Sqm" />
          <Input value={filters.maxSquareMeters} onChange={(e) => onChange('maxSquareMeters', e.target.value)} placeholder="Max Sqm" />

          <Select value={filters.sortBy} onChange={(e) => onChange('sortBy', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priceAsc">Price Low to High</option>
            <option value="priceDesc">Price High to Low</option>
          </Select>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="submit">Apply</Button>
          <Button type="button" variant="secondary" onClick={onClear}>
            Clear
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default SearchFilters

