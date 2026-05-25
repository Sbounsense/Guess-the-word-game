import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useGamification } from '../../context/GamificationContext.jsx'
import { calcLevel } from '../../utils/gamification.js'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const { getUserStats } = useGamification()
  const navigate = useNavigate()

  if (!currentUser) return null

  const stats = getUserStats(currentUser.id)
  const lvl = calcLevel(stats.totalXP)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const dashPath = `/${currentUser.role}`

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to={dashPath} className={styles.logo}>
          🎓 EduQuest
        </Link>

        <div className={styles.links}>
          {currentUser.role === 'student' && (
            <>
              <Link to="/student" className={styles.link}>My Learning</Link>
              <Link to="/leaderboard" className={styles.link}>Leaderboard</Link>
            </>
          )}
          {currentUser.role === 'teacher' && (
            <>
              <Link to="/teacher" className={styles.link}>Dashboard</Link>
              <Link to="/teacher/progress" className={styles.link}>Progress</Link>
            </>
          )}
          {currentUser.role === 'admin' && (
            <>
              <Link to="/admin" className={styles.link}>Dashboard</Link>
              <Link to="/admin/users" className={styles.link}>Users</Link>
              <Link to="/admin/subjects" className={styles.link}>Subjects</Link>
              <Link to="/admin/reports" className={styles.link}>Reports</Link>
            </>
          )}
        </div>

        <div className={styles.right}>
          {currentUser.role === 'student' && (
            <div className={styles.xpChip}>
              <span className={styles.flame}>🔥 {stats.currentStreak}</span>
              <span className={styles.level}>Lv {lvl.level}</span>
            </div>
          )}
          <Link to={currentUser.role === 'student' ? '/profile' : '#'} className={styles.avatar} style={{ background: currentUser.avatarColor }}>
            {currentUser.name[0].toUpperCase()}
          </Link>
          <span className={styles.name}>{currentUser.name}</span>
          <button onClick={handleLogout} className={styles.logout}>Logout</button>
        </div>
      </div>
    </nav>
  )
}
