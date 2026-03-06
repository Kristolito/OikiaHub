import api from './api'

export type PropertyListItemResponse = {
  id: number
  title: string
  price: number
  city: string
  area: string
  bedrooms: number
  bathrooms: number
  squareMeters: number
  listingType: number
  propertyType: number
  status: number
  primaryImageUrl?: string | null
  createdAt: string
}

export type PagedResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}

export type PropertyDetailsResponse = {
  id: number
  title: string
  description: string
  price: number
  propertyType: number
  listingType: number
  bedrooms: number
  bathrooms: number
  squareMeters: number
  address: string
  postalCode?: string | null
  cityId: number
  city: string
  areaId: number
  area: string
  latitude?: number | null
  longitude?: number | null
  yearBuilt?: number | null
  floor?: number | null
  status: number
  agentProfileId: number
  images: { id: number; imageUrl: string; isPrimary: boolean; sortOrder: number }[]
  amenities: { id: number; name: string }[]
}

export type SavePropertyRequest = {
  title: string
  description: string
  price: number
  propertyType: number
  listingType: number
  bedrooms: number
  bathrooms: number
  squareMeters: number
  address: string
  postalCode?: string
  cityId: number
  areaId: number
  latitude?: number | null
  longitude?: number | null
  yearBuilt?: number | null
  floor?: number | null
  status: number
  amenityIds: number[]
  imageUrls: string[]
  primaryImageUrl?: string | null
  agentProfileId?: number | null
}

export async function getProperties(page = 1, pageSize = 20, sortBy = 'newest') {
  const response = await api.get<PagedResponse<PropertyListItemResponse>>('/properties', {
    params: { page, pageSize, sortBy },
  })
  return response.data
}

export async function getProperty(id: number) {
  const response = await api.get<PropertyDetailsResponse>(`/properties/${id}`)
  return response.data
}

export async function createProperty(payload: SavePropertyRequest) {
  const response = await api.post<PropertyDetailsResponse>('/properties', payload)
  return response.data
}

export async function updateProperty(id: number, payload: SavePropertyRequest) {
  const response = await api.put<PropertyDetailsResponse>(`/properties/${id}`, payload)
  return response.data
}

export async function deleteProperty(id: number) {
  await api.delete(`/properties/${id}`)
}
