import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import FavoriteButton from '../components/FavoriteButton'
import PageTitle from '../components/PageTitle'
import useAuthState from '../hooks/useAuthState'
import { checkFavorite } from '../services/favoritesService'
import { getProperty, type PropertyDetailsResponse } from '../services/propertyService'

function PropertyDetails() {
  const { id } = useParams()
  const { isAuthenticated } = useAuthState()
  const [property, setProperty] = useState<PropertyDetailsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    const propertyId = Number(id)
    if (!Number.isFinite(propertyId) || propertyId <= 0) {
      setError('Invalid property id.')
      return
    }

    void (async () => {
      setLoading(true)
      setError('')
      try {
        const response = await getProperty(propertyId)
        setProperty(response)
        if (isAuthenticated) {
          const favoriteStatus = await checkFavorite(propertyId)
          setIsFavorited(favoriteStatus.isFavorited)
        } else {
          setIsFavorited(false)
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError('Property not found.')
        } else {
          setError(err?.response?.data?.message ?? 'Failed to load property.')
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [id, isAuthenticated])

  return (
    <section>
      <PageTitle title="Property Details" />
      {loading && <p className="mt-3 text-slate-600">Loading property...</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}
      {!loading && !error && property && (
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{property.title}</h2>
            <p className="text-slate-600">
              {property.city}, {property.area}
            </p>
            <p className="text-3xl font-bold">${property.price.toLocaleString()}</p>
            <p className="text-slate-700">{property.description}</p>
            <FavoriteButton propertyId={property.id} isFavorited={isFavorited} onChanged={setIsFavorited} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {property.images.length > 0 ? (
              property.images.map((image) => (
                <img key={image.id} src={image.imageUrl} alt={property.title} className="h-44 w-full rounded-lg object-cover" />
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-slate-500">No images available.</div>
            )}
          </div>

          <div className="grid gap-4 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-2">
            <p>Bedrooms: {property.bedrooms}</p>
            <p>Bathrooms: {property.bathrooms}</p>
            <p>Square Meters: {property.squareMeters}</p>
            <p>Address: {property.address}</p>
            <p>Postal Code: {property.postalCode || '-'}</p>
            <p>Year Built: {property.yearBuilt ?? '-'}</p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Amenities</h3>
            {property.amenities.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <li key={amenity.id} className="rounded bg-slate-100 px-3 py-1 text-sm">
                    {amenity.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-slate-600">No amenities listed.</p>
            )}
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Agent</h3>
            <p className="mt-1">
              {property.agent.firstName} {property.agent.lastName}
            </p>
            <p className="text-slate-600">{property.agent.email}</p>
            <p className="text-slate-600">{property.agent.phoneNumber}</p>
            <p className="text-slate-600">{property.agent.agencyName}</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default PropertyDetails
