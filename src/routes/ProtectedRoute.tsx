import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { canManageListings, isAdminRole } from '../auth/roles'
import { getToken } from '../api/client'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'

interface ProtectedRouteProps {
  requireAdmin?: boolean
  requireManage?: boolean
}

export function ProtectedRoute({ requireAdmin = false, requireManage = false }: ProtectedRouteProps) {
  const location = useLocation()
  const { isLoading, user } = useAuth()

  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (isLoading) {
    return <LoadingState label="Checking access..." rows={2} />
  }

  if (requireAdmin && !isAdminRole(user?.role)) {
    return (
      <ErrorState
        title="Access forbidden"
        message="You do not have permission to view activity logs."
      />
    )
  }

  if (requireManage && !canManageListings(user?.role)) {
    return (
      <ErrorState
        title="Access forbidden"
        message="You do not have permission to import listings."
      />
    )
  }

  return <Outlet />
}
