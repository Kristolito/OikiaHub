import api from './api'

export type AgentPropertyListItemResponse = {
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
}

export type AgentProfileResponse = {
  id: number
  userId: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  agencyName: string
  bio?: string | null
  profileImageUrl?: string | null
  publishedPropertyCount: number
  properties: AgentPropertyListItemResponse[]
}

export async function getAgentProfile(id: number) {
  const response = await api.get<AgentProfileResponse>(`/agents/${id}`)
  return response.data
}
