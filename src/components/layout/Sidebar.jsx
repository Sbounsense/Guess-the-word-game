import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useGamification } from '../../context/GamificationContext.jsx'
import { calcLevel } from '../../utils/gamification.js'
import styles from './Sidebar.module.css'

const NAV = {
  student: [
    { to: '/student',          icon: '⊞', label: 'Dashboard'   },
    { to: '/student/tasks',    icon: '✓',  label: 'Tasks'       },
    { to: '/student/focus',    icon: '⏱',  label: 'Focus'       },
    { to: '/student/library',  icon: '📚', label: 'Library'     },
    { to: '/student/progress', icon: '◑',  label: 'Progress'    },
    { to: '/leaderboard',      icon: '🏆', label: 'Leaderboard' },
    { to: '/profile',          icon: '◎',  label: 'My Profile'  },
  ],
  teacher: [
    { to: '/teacher',          icon: '⊞', label: 'Dashboard' },
    { to: '/teacher/modules/new', icon: '+', label: 'New Module' },
    { to: '/teacher/decks/new',   icon: '⊕', label: 'New Deck' },
    { to: '/teacher/homework/new',icon: '✎', label: 'New Homework' },
    { to: '/teacher/progress',    icon: '◑', label: 'Progress' },
  ],
  admin: [
    { to: '/admin',          icon: '⊞', label: 'Overview' },
    { to: '/admin/users',    icon: '◎',  label: 'Users' },
    { to: '/admin/subjects', icon: '☰',  label: 'Subjects' },
    { to: '/admin/reports',  icon: '◑',  label: 'Reports' },
  ],
}

export default function Sidebar() {
  const { currentUser, logout } = useAuth()
  const { getUserStats } = useGamification()
  const navigate = useNavigate()

  if (!currentUser) return null

  const stats = getUserStats(currentUser.id)
  const lvl = calcLevel(stats.totalXP)
  const links = NAV[currentUser.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>E</div>
        <span className={styles.logoText}>EduQuest</span>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        <p className={styles.navLabel}>{currentUser.role.toUpperCase()}</p>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to.split('/').length <= 2}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.icon}>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={styles.user}>
        {currentUser.role === 'student' && (
          <div className={styles.xpRow}>
            <div className={styles.xpBar}>
              <div className={styles.xpFill} style={{ width: `${lvl.progress}%` }} />
            </div>
            <span className={styles.xpText}>Lv {lvl.level} · {stats.totalXP} XP</span>
          </div>
        )}
        <div className={styles.userRow}>
          <div className={styles.avatar} style={{ background: currentUser.avatarColor }}>
            {currentUser.name[0].toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{currentUser.name}</div>
            <span className={`badge-chip chip-${currentUser.role}`}>{currentUser.role}</span>
          </div>
        </div>
        <button className={styles.logout} onClick={handleLogout}>Sign out</button>
      </div>
    </aside>
  )
}
