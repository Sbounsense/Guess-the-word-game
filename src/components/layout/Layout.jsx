import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import Sidebar from './Sidebar.jsx'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  const { currentUser } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!currentUser) return <>{children}</>

  return (
    <div className="app-shell">
      <div className={styles.mobileBar}>
        <button className={styles.hamburger} onClick={() => setMobileOpen(true)} aria-label="Open menu">
          ☰
        </button>
        <span className={styles.mobileLogo}>EduQuest</span>
        <div style={{ width: 40 }} />
      </div>

      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="app-main">
        {children}
      </main>
    </div>
  )
}
