import api, { AUTH_TOKEN_KEY } from './api'

export const AUTH_USER_KEY = 'oikiahub_auth_user'

export type RegisterRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type CurrentUserResponse = {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
}

export type AuthResponse = {
  token: string
  expiresAtUtc: string
  user: CurrentUserResponse
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', payload)
  return response.data
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', payload)
  return response.data
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await api.get<CurrentUserResponse>('/auth/me')
  return response.data
}

export function persistAuth(auth: AuthResponse) {
  localStorage.setItem(AUTH_TOKEN_KEY, auth.token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(auth.user))
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}
