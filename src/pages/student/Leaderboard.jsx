import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { storage } from '../../services/storage.js'
import { calcLevel } from '../../utils/gamification.js'
import Card from '../../components/ui/Card.jsx'
import styles from './Leaderboard.module.css'

export default function Leaderboard() {
  const { currentUser } = useAuth()
  const { getUsers } = useData()
  const [tab, setTab] = useState('alltime')

  const students = getUsers().filter(u => u.role === 'student' && u.active !== false)
  const gamificationMap = storage.getGamification()

  const ranked = students
    .map(u => {
      const g = gamificationMap[u.id] || { totalXP: 0, weeklyPoints: 0, currentStreak: 0 }
      return { ...u, totalXP: g.totalXP, weeklyPoints: g.weeklyPoints || 0, streak: g.currentStreak }
    })
    .sort((a, b) => tab === 'weekly' ? b.weeklyPoints - a.weeklyPoints : b.totalXP - a.totalXP)

  return (
    <div className="page">
      <h1 className="page-title">🏆 Leaderboard</h1>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'alltime' ? styles.tabActive : ''}`} onClick={() => setTab('alltime')}>All Time</button>
        <button className={`${styles.tab} ${tab === 'weekly' ? styles.tabActive : ''}`} onClick={() => setTab('weekly')}>This Week</button>
      </div>

      {ranked.length === 0 ? (
        <div className="empty-state"><p>No students yet.</p></div>
      ) : (
        <div className={styles.list}>
          {ranked.map((u, i) => {
            const lvl = calcLevel(u.totalXP)
            const isMe = u.id === currentUser.id
            const pts = tab === 'weekly' ? u.weeklyPoints : u.totalXP
            return (
              <Card key={u.id} className={`${styles.row} ${isMe ? styles.me : ''}`}>
                <span className={styles.rank}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span className={styles.avatar} style={{ background: u.avatarColor }}>
                  {u.name[0].toUpperCase()}
                </span>
                <div className={styles.info}>
                  <span className={styles.name}>{u.name} {isMe && <span className={styles.youTag}>You</span>}</span>
                  <span className={styles.sub}>Lv {lvl.level} {lvl.label} · 🔥 {u.streak}</span>
                </div>
                <span className={styles.xp}>{pts} {tab === 'weekly' ? 'pts' : 'XP'}</span>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
