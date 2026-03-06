import { useMemo, useState } from 'react'
import { AUTH_TOKEN_KEY } from '../services/api'
import { AUTH_USER_KEY, type CurrentUserResponse, clearAuth, persistAuth, type AuthResponse } from '../services/authService'

function readUserFromStorage(): CurrentUserResponse | null {
  const raw = localStorage.getItem(AUTH_USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as CurrentUserResponse
  } catch {
    return null
  }
}

export default function useAuthState() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY))
  const [user, setUser] = useState<CurrentUserResponse | null>(() => readUserFromStorage())

  const isAuthenticated = useMemo(() => Boolean(token), [token])

  const setAuth = (response: AuthResponse) => {
    persistAuth(response)
    setToken(response.token)
    setUser(response.user)
  }

  const logout = () => {
    clearAuth()
    setToken(null)
    setUser(null)
  }

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    logout,
  }
}
