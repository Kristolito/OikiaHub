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
  primaryImageUrl?: string | null
  createdAt: string
}

export type PagedResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
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
  agent: {
    id: number
    userId: number
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    agencyName: string
    profileImageUrl?: string | null
  }
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

export type GetPropertiesRequest = {
  searchTerm?: string
  cityId?: number
  areaId?: number
  listingType?: number
  propertyType?: number
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  minSquareMeters?: number
  maxSquareMeters?: number
  sortBy?: 'newest' | 'oldest' | 'priceAsc' | 'priceDesc'
  page?: number
  pageSize?: number
}

export type LookupItem = {
  id: number
  name: string
}

export async function getProperties(query: GetPropertiesRequest = {}) {
  const response = await api.get<PagedResponse<PropertyListItemResponse>>('/properties', {
    params: {
      searchTerm: query.searchTerm,
      cityId: query.cityId,
      areaId: query.areaId,
      listingType: query.listingType,
      propertyType: query.propertyType,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      minBedrooms: query.minBedrooms,
      maxBedrooms: query.maxBedrooms,
      minBathrooms: query.minBathrooms,
      maxBathrooms: query.maxBathrooms,
      minSquareMeters: query.minSquareMeters,
      maxSquareMeters: query.maxSquareMeters,
      sortBy: query.sortBy ?? 'newest',
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 12,
    },
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

export async function getCities() {
  const response = await api.get<LookupItem[]>('/lookups/cities')
  return response.data
}

export async function getAreas(cityId?: number) {
  const response = await api.get<LookupItem[]>('/lookups/areas', {
    params: cityId ? { cityId } : {},
  })
  return response.data
}

export async function getAmenities() {
  const response = await api.get<LookupItem[]>('/lookups/amenities')
  return response.data
}
