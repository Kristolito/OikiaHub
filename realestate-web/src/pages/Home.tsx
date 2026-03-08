import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resolveImageUrl } from '../services/api'
import { getProperties, type PropertyListItemResponse } from '../services/propertyService'
import { getRecentlyViewed, type RecentlyViewedItem } from '../services/recentlyViewedService'

const fallbackFeatured: PropertyListItemResponse[] = [
  {
    id: -1,
    title: 'Modern Family Villa',
    price: 420000,
    city: 'Athens',
    area: 'Kifisia',
    bedrooms: 5,
    bathrooms: 3,
    squareMeters: 240,
    listingType: 1,
    propertyType: 2,
    primaryImageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: -2,
    title: 'Luxury Waterfront House',
    price: 680000,
    city: 'Athens',
    area: 'Vouliagmeni',
    bedrooms: 4,
    bathrooms: 3,
    squareMeters: 210,
    listingType: 1,
    propertyType: 2,
    primaryImageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: -3,
    title: 'City Apartment Penthouse',
    price: 290000,
    city: 'Athens',
    area: 'Kolonaki',
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 140,
    listingType: 2,
    propertyType: 1,
    primaryImageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
]

function Home() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState<PropertyListItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([])
  const [heroSearch, setHeroSearch] = useState('')
  const sliderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const response = await getProperties({ page: 1, pageSize: 12, sortBy: 'newest' })
        setFeatured(response.items)
      } catch {
        try {
          const retry = await getProperties()
          setFeatured(retry.items)
        } catch {
          setFeatured(fallbackFeatured)
          setError('')
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed())
  }, [])

  const scrollSlider = (direction: 'left' | 'right') => {
    const node = sliderRef.current
    if (!node) {
      return
    }

    const amount = Math.max(320, Math.floor(node.clientWidth * 0.85))
    const delta = direction === 'left' ? -amount : amount
    node.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="space-y-12">
      <div className="overflow-hidden rounded-2xl border border-border bg-[linear-gradient(180deg,#0B1220_0%,#0F172A_100%)] p-8 shadow-panel sm:p-10 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-slate-700 bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Real Estate Marketplace
            </p>
            <h1 className="text-5xl font-bold leading-tight text-text-primary">
              Find Your Next Home With Confidence
            </h1>
            <p className="mt-5 max-w-xl text-base text-text-secondary sm:text-lg">
              Browse verified listings, compare neighborhoods, and connect directly with agents in one clean experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  const trimmed = heroSearch.trim()
                  navigate(trimmed ? `/properties?searchTerm=${encodeURIComponent(trimmed)}&page=1` : '/properties')
                }}
                className="flex w-full max-w-xl items-center gap-2"
              >
                <input
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search by city, area, title..."
                  className="w-full rounded-lg border border-border bg-nav px-4 py-3 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 ease-in-out focus:border-primary focus:outline-none"
                />
                <button type="submit" className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-primary-hover">
                  Search
                </button>
              </form>
              <Link to="/properties" className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-primary-hover">
                Explore Properties
              </Link>
              <Link to="/dashboard" className="rounded-lg border border-slate-700 bg-transparent px-5 py-3 text-sm font-semibold text-text-primary transition-all duration-200 ease-in-out hover:bg-elevated">
                Manage Listings
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-surface p-6 shadow-soft">
            <p className="text-sm text-text-secondary">Platform Highlights</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-700 bg-elevated p-6 shadow-soft transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-panel">
                <p className="text-2xl font-bold text-accent">10k+</p>
                <p className="text-sm text-text-secondary">Active seekers</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-elevated p-6 shadow-soft transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-panel">
                <p className="text-2xl font-bold text-accent">2k+</p>
                <p className="text-sm text-text-secondary">Verified listings</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-elevated p-6 shadow-soft transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-panel">
                <p className="text-2xl font-bold text-accent">150+</p>
                <p className="text-sm text-text-secondary">Partner agents</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-elevated p-6 shadow-soft transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-panel">
                <p className="text-2xl font-bold text-accent">24/7</p>
                <p className="text-sm text-text-secondary">Availability</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {recentlyViewed.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">Recently Viewed</h2>
            <p className="text-base text-text-secondary">Jump back to homes you opened recently.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewed.map((property) => (
              <article key={property.id} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-panel">
                <div className="relative aspect-[16/10] bg-nav">
                  {property.primaryImageUrl ? (
                    <img src={resolveImageUrl(property.primaryImageUrl)} alt={property.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-text-muted">No image</div>
                  )}
                </div>
                <div className="space-y-2 p-6">
                  <h3 className="line-clamp-1 text-base font-semibold text-text-primary">{property.title}</h3>
                  <p className="text-xs text-text-secondary">{property.city}, {property.area}</p>
                  <p className="text-sm font-semibold text-text-primary">${property.price.toLocaleString()}</p>
                  <Link to={`/properties/${property.id}`} className="text-xs font-semibold text-primary transition-all duration-200 ease-in-out hover:text-primary-hover">
                    View again
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">Featured Homes</h2>
            <p className="text-base text-text-secondary">A quick look at the newest properties on OikiaHub.</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              className="rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-sm text-text-primary transition-all duration-200 ease-in-out hover:bg-elevated"
              onClick={() => scrollSlider('left')}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-sm text-text-primary transition-all duration-200 ease-in-out hover:bg-elevated"
              onClick={() => scrollSlider('right')}
            >
              Next
            </button>
          </div>
        </div>

        {loading && <p className="text-text-secondary">Loading featured homes...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && featured.length > 0 && (
          <div ref={sliderRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {featured.map((property) => (
              <article key={property.id} className="w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-panel">
                <div className="relative aspect-[16/10] bg-nav">
                  {property.primaryImageUrl ? (
                    <img src={resolveImageUrl(property.primaryImageUrl)} alt={property.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-text-muted">No image</div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full border border-slate-700 bg-nav/90 px-2 py-1 text-xs font-semibold text-text-primary">
                    {property.listingType === 2 ? 'For Rent' : 'For Sale'}
                  </span>
                </div>
                <div className="space-y-2 p-6">
                  <h3 className="line-clamp-1 text-lg font-semibold text-text-primary">{property.title}</h3>
                  <p className="text-sm text-text-secondary">
                    {property.city}, {property.area}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {property.bedrooms} bd | {property.bathrooms} ba | {property.squareMeters} sqm
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-lg font-bold text-text-primary">${property.price.toLocaleString()}</p>
                    <Link
                      to={property.id > 0 ? `/properties/${property.id}` : '/properties'}
                      className="rounded-lg border border-slate-700 bg-transparent px-3 py-2 text-xs font-semibold text-text-primary transition-all duration-200 ease-in-out hover:bg-elevated"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && featured.length === 0 && <p className="text-text-secondary">No featured properties yet.</p>}
      </div>
    </section>
  )
}

export default Home
