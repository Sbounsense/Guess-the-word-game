import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'

export default function ProtectedRoute({ children, roles }) {
  const { currentUser, loading } = useAuth()
  const { dataLoading } = useData()

  if (loading || (currentUser && dataLoading)) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</div>
  }
  if (!currentUser) return <Navigate to="/login" replace />
  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to={`/${currentUser.role}`} replace />
  }
  return children
}
