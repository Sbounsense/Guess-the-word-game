import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({ children, roles }) {
  const { currentUser, loading } = useAuth()

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>
  if (!currentUser) return <Navigate to="/login" replace />
  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to={`/${currentUser.role}`} replace />
  }

  return children
}
