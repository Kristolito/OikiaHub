import { Link } from 'react-router-dom'
import type { PropertyListItemResponse } from '../services/propertyService'
import FavoriteButton from './FavoriteButton'
import { resolveImageUrl } from '../services/api'
import Card from './ui/Card'

type PropertyCardProps = {
  property: PropertyListItemResponse
  isFavorited?: boolean
  onFavoriteChanged?: (isFavorited: boolean) => void
}

function PropertyCard({ property, isFavorited = false, onFavoriteChanged }: PropertyCardProps) {
  const listingLabel = property.listingType === 2 ? 'For Rent' : 'For Sale'

  return (
    <Card className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800">
        {property.primaryImageUrl ? (
          <img
            src={resolveImageUrl(property.primaryImageUrl)}
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">No image</div>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {listingLabel}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{property.title}</h3>
          <p className="shrink-0 text-lg font-bold text-slate-900 dark:text-slate-100">${property.price.toLocaleString()}</p>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {property.city}, {property.area}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {property.bedrooms} bd | {property.bathrooms} ba | {property.squareMeters} sqm
        </p>
        <div className="flex items-center gap-2 pt-1">
          <Link
            to={`/properties/${property.id}`}
            className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            View details
          </Link>
          <FavoriteButton propertyId={property.id} isFavorited={isFavorited} onChanged={onFavoriteChanged} />
        </div>
      </div>
    </Card>
  )
}

export default PropertyCard
