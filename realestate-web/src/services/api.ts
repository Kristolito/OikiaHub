import axios from 'axios'

export const AUTH_TOKEN_KEY = 'oikiahub_auth_token'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export function resolveImageUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return ''
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  const origin = new URL(API_BASE_URL).origin
  if (imageUrl.startsWith('/')) {
    return `${origin}${imageUrl}`
  }

  return `${origin}/${imageUrl}`
}

export default api
