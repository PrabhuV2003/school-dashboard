import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, user } = useAuthStore()

  // Not logged in at all → go to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role → go to login
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />
  }

  return children
}