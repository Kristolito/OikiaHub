import api from './api'
export type AddFavoriteRequest = {
  propertyId: number
}

export type FavoriteStatusResponse = {
  propertyId: number
  isFavorited: boolean
}

export type FavoriteItemResponse = {
  propertyId: number
  title: string
  price: number
  city: string
  area: string
  bedrooms: number
  bathrooms: number
  squareMeters: number
  listingType: number
  propertyType: number
  primaryImageUrl?: string | null
  favoritedAt: string
}

export async function addFavorite(propertyId: number) {
  const response = await api.post<FavoriteStatusResponse>('/favorites', { propertyId } as AddFavoriteRequest)
  return response.data
}

export async function removeFavorite(propertyId: number) {
  await api.delete(`/favorites/${propertyId}`)
}

export async function getMyFavorites() {
  const response = await api.get<FavoriteItemResponse[]>('/favorites')
  return response.data
}

export async function checkFavorite(propertyId: number) {
  const response = await api.get<FavoriteStatusResponse>(`/favorites/check/${propertyId}`)
  return response.data
}
