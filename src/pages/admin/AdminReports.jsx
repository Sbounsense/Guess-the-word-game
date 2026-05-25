import { useData } from '../../context/DataContext.jsx'
import { storage } from '../../services/storage.js'
import { calcLevel } from '../../utils/gamification.js'
import Card from '../../components/ui/Card.jsx'
import styles from './AdminReports.module.css'

export default function AdminReports() {
  const { getUsers, getModules, getDecks } = useData()

  const students = getUsers().filter(u => u.role === 'student')
  const progress = storage.getProgress()

  const totalSessions = progress.length
  const totalCorrect = progress.reduce((s, p) => s + p.score, 0)
  const totalCards = progress.reduce((s, p) => s + p.total, 0)
  const avgAccuracy = totalCards ? Math.round((totalCorrect / totalCards) * 100) : 0

  return (
    <div className="page">
      <h1 className="page-title">Centre Reports</h1>

      <div className="grid-3" style={{ marginBottom: 32 }}>
        <Card>
          <div className={styles.statVal}>{students.length}</div>
          <div className={styles.statLabel}>Total Students</div>
        </Card>
        <Card>
          <div className={styles.statVal}>{totalSessions}</div>
          <div className={styles.statLabel}>Study Sessions</div>
        </Card>
        <Card>
          <div className={styles.statVal}>{avgAccuracy}%</div>
          <div className={styles.statLabel}>Avg. Accuracy</div>
        </Card>
      </div>

      <Card>
        <h2 className="section-title" style={{ marginBottom: 16 }}>Student Overview</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Student</th><th>Level</th><th>XP</th><th>Sessions</th><th>Streak</th></tr>
            </thead>
            <tbody>
              {students.map(s => {
                const g = storage.getUserGamification(s.id)
                const lvl = calcLevel(g.totalXP)
                const sp = progress.filter(p => p.userId === s.id)
                return (
                  <tr key={s.id}>
                    <td>
                      <div className={styles.nameCell}>
                        <span className={styles.avatar} style={{ background: s.avatarColor }}>{s.name[0]}</span>
                        {s.name}
                      </div>
                    </td>
                    <td>Lv {lvl.level} — {lvl.label}</td>
                    <td className={styles.xp}>{g.totalXP}</td>
                    <td>{sp.length}</td>
                    <td>🔥 {g.currentStreak}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
