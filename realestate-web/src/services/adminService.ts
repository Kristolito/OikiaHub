import api from './api'

export type AdminDashboardResponse = {
  totalUsers: number
  totalAgents: number
  totalProperties: number
  totalPublishedProperties: number
  totalDraftProperties: number
  totalSoldProperties: number
  totalInquiries: number
  recentUsersCount: number
  recentPropertiesCount: number
}

export type AdminUserListItemResponse = {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  createdAt: string
}

export type AdminUserDetailsResponse = {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  createdAt: string
  agentProfile: {
    id: number
    phoneNumber: string
    agencyName: string
    bio?: string | null
    profileImageUrl?: string | null
  } | null
  propertyCount: number
  inquiryCount: number
}

export type AdminPropertyListItemResponse = {
  id: number
  title: string
  price: number
  agentName: string
  agentEmail: string
  city: string
  area: string
  status: number
  createdAt: string
}

export type AdminPropertyDetailsResponse = {
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
    agentProfileId: number
    userId: number
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    agencyName: string
  }
  images: Array<{
    id: number
    imageUrl: string
    isPrimary: boolean
    sortOrder: number
  }>
  amenities: Array<{
    id: number
    name: string
  }>
  createdAt: string
  updatedAt: string
}

export async function getAdminDashboard() {
  const response = await api.get<AdminDashboardResponse>('/admin/dashboard')
  return response.data
}

export async function getAdminUsers() {
  const response = await api.get<AdminUserListItemResponse[]>('/admin/users')
  return response.data
}

export async function getAdminUserById(id: number) {
  const response = await api.get<AdminUserDetailsResponse>(`/admin/users/${id}`)
  return response.data
}

export async function getAdminProperties() {
  const response = await api.get<AdminPropertyListItemResponse[]>('/admin/properties')
  return response.data
}

export async function getAdminPropertyById(id: number) {
  const response = await api.get<AdminPropertyDetailsResponse>(`/admin/properties/${id}`)
  return response.data
}

export async function updateAdminPropertyStatus(id: number, status: number) {
  const response = await api.patch<AdminPropertyDetailsResponse>(`/admin/properties/${id}/status`, { status })
  return response.data
}

export async function deleteAdminProperty(id: number) {
  await api.delete(`/admin/properties/${id}`)
}
