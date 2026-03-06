import { Navigate, Outlet } from 'react-router-dom'
import useAuthState from '../hooks/useAuthState'

type RequireRoleProps = {
  roles: string[]
}

function RequireRole({ roles }: RequireRoleProps) {
  const { isAuthenticated, user } = useAuthState()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default RequireRole
