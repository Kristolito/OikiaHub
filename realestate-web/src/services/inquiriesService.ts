import api from './api'

export type InquiryStatus = 1 | 2 | 3 | 4

export type CreateInquiryRequest = {
  propertyId: number
  fullName: string
  email: string
  phoneNumber?: string
  message: string
}

export type InquiryListItemResponse = {
  id: number
  propertyId: number
  propertyTitle: string
  fullName: string
  email: string
  phoneNumber?: string | null
  messagePreview: string
  createdAt: string
  status: InquiryStatus
}

export type InquiryDetailsResponse = {
  id: number
  propertyId: number
  propertyTitle: string
  propertyCity: string
  propertyArea: string
  propertyPrice: number
  fullName: string
  email: string
  phoneNumber?: string | null
  message: string
  createdAt: string
  status: InquiryStatus
  user: {
    id: number
    firstName: string
    lastName: string
  }
  agent: {
    agentProfileId: number
    userId: number
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
  }
}

export type UpdateInquiryStatusRequest = {
  status: InquiryStatus
}

export async function createInquiry(payload: CreateInquiryRequest) {
  const response = await api.post<InquiryDetailsResponse>('/inquiries', payload)
  return response.data
}

export async function getMyInquiries() {
  const response = await api.get<InquiryListItemResponse[]>('/inquiries/my')
  return response.data
}

export async function getAgentInquiries() {
  const response = await api.get<InquiryListItemResponse[]>('/inquiries/agent')
  return response.data
}

export async function getAdminInquiries() {
  const response = await api.get<InquiryListItemResponse[]>('/inquiries/admin')
  return response.data
}

export async function getInquiryDetails(id: number) {
  const response = await api.get<InquiryDetailsResponse>(`/inquiries/${id}`)
  return response.data
}

export async function updateInquiryStatus(id: number, payload: UpdateInquiryStatusRequest) {
  const response = await api.patch<InquiryDetailsResponse>(`/inquiries/${id}/status`, payload)
  return response.data
}

export function inquiryStatusLabel(status: InquiryStatus) {
  switch (status) {
    case 1:
      return 'New'
    case 2:
      return 'Read'
    case 3:
      return 'Replied'
    case 4:
      return 'Closed'
    default:
      return 'Unknown'
  }
}
