import { Link } from 'react-router-dom'
import type { PropertyListItemResponse } from '../services/propertyService'
import FavoriteButton from './FavoriteButton'
import { resolveImageUrl } from '../services/api'

type PropertyCardProps = {
  property: PropertyListItemResponse
  isFavorited?: boolean
  onFavoriteChanged?: (isFavorited: boolean) => void
}

function PropertyCard({ property, isFavorited = false, onFavoriteChanged }: PropertyCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[16/10] bg-slate-100">
        {property.primaryImageUrl ? (
          <img src={resolveImageUrl(property.primaryImageUrl)} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-lg font-semibold">{property.title}</h3>
        <p className="text-sm text-slate-600">
          {property.city}, {property.area}
        </p>
        <p className="text-sm text-slate-600">
          {property.bedrooms} bd | {property.bathrooms} ba | {property.squareMeters} sqm
        </p>
        <p className="text-xl font-bold text-slate-900">${property.price.toLocaleString()}</p>
        <div className="flex items-center gap-2">
          <Link
            to={`/properties/${property.id}`}
            className="inline-flex rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            View details
          </Link>
          <FavoriteButton propertyId={property.id} isFavorited={isFavorited} onChanged={onFavoriteChanged} />
        </div>
      </div>
    </article>
  )
}

export default PropertyCard
