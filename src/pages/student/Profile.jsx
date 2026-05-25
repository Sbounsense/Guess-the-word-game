import { useAuth } from '../../context/AuthContext.jsx'
import { useGamification } from '../../context/GamificationContext.jsx'
import { storage } from '../../services/storage.js'
import { calcLevel } from '../../utils/gamification.js'
import XPBar from '../../components/gamification/XPBar.jsx'
import BadgeGrid from '../../components/gamification/BadgeGrid.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './Profile.module.css'

export default function Profile() {
  const { currentUser } = useAuth()
  const { getUserStats } = useGamification()
  const stats = getUserStats(currentUser.id)
  const progress = storage.getProgress().filter(p => p.userId === currentUser.id)
  const lvl = calcLevel(stats.totalXP)

  return (
    <div className="page">
      <div className={styles.header}>
        <div className={styles.avatar} style={{ background: currentUser.avatarColor }}>
          {currentUser.name[0].toUpperCase()}
        </div>
        <div>
          <h1 className={styles.name}>{currentUser.name}</h1>
          <span className={`badge-chip chip-${currentUser.role}`}>{currentUser.role}</span>
        </div>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <XPBar totalXP={stats.totalXP} />
      </Card>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <Card>
          <div className={styles.statVal}>{stats.totalSessions || 0}</div>
          <div className={styles.statLabel}>Sessions</div>
        </Card>
        <Card>
          <div className={styles.statVal}>{stats.totalCorrect || 0}</div>
          <div className={styles.statLabel}>Correct Answers</div>
        </Card>
        <Card>
          <div className={styles.statVal}>🔥 {stats.currentStreak || 0}</div>
          <div className={styles.statLabel}>Current Streak</div>
        </Card>
        <Card>
          <div className={styles.statVal}>{stats.longestStreak || 0}</div>
          <div className={styles.statLabel}>Best Streak</div>
        </Card>
      </div>

      <Card>
        <h2 className="section-title" style={{ marginBottom: 16 }}>Badges</h2>
        <BadgeGrid earnedIds={stats.badges || []} />
      </Card>
    </div>
  )
}
