import { useAuth } from '../../context/AuthContext.jsx'
import Sidebar from './Sidebar.jsx'

export default function Layout({ children }) {
  const { currentUser } = useAuth()

  if (!currentUser) return <>{children}</>

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}
