import { Link } from 'react-router-dom'
import type { PropertyListItemResponse } from '../services/propertyService'

type PropertyCardProps = {
  property: PropertyListItemResponse
}

function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[16/10] bg-slate-100">
        {property.primaryImageUrl ? (
          <img src={property.primaryImageUrl} alt={property.title} className="h-full w-full object-cover" />
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
        <Link
          to={`/properties/${property.id}`}
          className="inline-flex rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          View details
        </Link>
      </div>
    </article>
  )
}

export default PropertyCard
