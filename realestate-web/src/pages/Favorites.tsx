import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import PageTitle from '../components/PageTitle'
import useAuthState from '../hooks/useAuthState'
import { getMyFavorites, type FavoriteItemResponse } from '../services/favoritesService'

function Favorites() {
  const { isAuthenticated } = useAuthState()
  const [items, setItems] = useState<FavoriteItemResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    void (async () => {
      setLoading(true)
      setError('')
      try {
        const favorites = await getMyFavorites()
        setItems(favorites)
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Failed to load favorites.')
      } finally {
        setLoading(false)
      }
    })()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const onFavoriteChanged = (propertyId: number, isFavorited: boolean) => {
    if (!isFavorited) {
      setItems((prev) => prev.filter((x) => x.propertyId !== propertyId))
    }
  }

  return (
    <section>
      <PageTitle title="Favorites" />
      <div className="mt-6">
        {loading && <p className="text-slate-600">Loading favorites...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="text-slate-600">You have no saved properties yet.</p>}
        {!loading && !error && items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((favorite) => (
              <PropertyCard
                key={favorite.propertyId}
                property={{
                  id: favorite.propertyId,
                  title: favorite.title,
                  price: favorite.price,
                  city: favorite.city,
                  area: favorite.area,
                  bedrooms: favorite.bedrooms,
                  bathrooms: favorite.bathrooms,
                  squareMeters: favorite.squareMeters,
                  listingType: favorite.listingType,
                  propertyType: favorite.propertyType,
                  primaryImageUrl: favorite.primaryImageUrl,
                  createdAt: favorite.favoritedAt,
                }}
                isFavorited
                onFavoriteChanged={(isFavorited) => onFavoriteChanged(favorite.propertyId, isFavorited)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Favorites
