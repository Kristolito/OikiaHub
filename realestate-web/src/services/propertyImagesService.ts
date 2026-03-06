import api from './api'

export type PropertyImageItemResponse = {
  id: number
  propertyId: number
  imageUrl: string
  isPrimary: boolean
  sortOrder: number
}

export async function getPropertyImages(propertyId: number) {
  const response = await api.get<PropertyImageItemResponse[]>(`/properties/${propertyId}/images`)
  return response.data
}

export async function uploadPropertyImages(propertyId: number, files: FileList | File[]) {
  const formData = new FormData()
  Array.from(files).forEach((file) => formData.append('files', file))

  const response = await api.post<PropertyImageItemResponse[]>(`/properties/${propertyId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

export async function deletePropertyImage(propertyId: number, imageId: number) {
  await api.delete(`/properties/${propertyId}/images/${imageId}`)
}

export async function setPrimaryPropertyImage(propertyId: number, imageId: number) {
  const response = await api.patch<PropertyImageItemResponse[]>(`/properties/${propertyId}/images/${imageId}/primary`)
  return response.data
}

export async function reorderPropertyImages(propertyId: number, imageIds: number[]) {
  const response = await api.patch<PropertyImageItemResponse[]>(`/properties/${propertyId}/images/reorder`, { imageIds })
  return response.data
}
