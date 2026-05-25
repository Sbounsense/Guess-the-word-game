import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { useGamification } from '../../context/GamificationContext.jsx'
import XPBar from '../../components/gamification/XPBar.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './StudentDashboard.module.css'

const today = new Date().toISOString().slice(0, 10)

export default function StudentDashboard() {
  const { currentUser } = useAuth()
  const { getModules, getLessons, getHomework, getSubmissions, getCompletions } = useData()
  const { getUserStats } = useGamification()
  const navigate = useNavigate()

  const stats = getUserStats(currentUser.id)
  const myModules = getModules().filter(m => m.assignedTo?.includes(currentUser.id))
  const myHomework = getHomework().filter(h => h.assignedTo?.includes(currentUser.id))
  const submissions = getSubmissions().filter(s => s.studentId === currentUser.id)
  const completions = getCompletions(currentUser.id)

  const pendingHw = myHomework
    .filter(h => !submissions.find(s => s.homeworkId === h.id))
    .sort((a, b) => {
      const aOver = a.dueDate && a.dueDate < today
      const bOver = b.dueDate && b.dueDate < today
      if (aOver && !bOver) return -1
      if (!aOver && bOver) return 1
      return 0
    })

  return (
    <div className="page">
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Welcome back, {currentUser.name}! 👋</h1>
          {stats.currentStreak > 0 && (
            <p className={styles.streak}>🔥 {stats.currentStreak}-day streak! Keep it up!</p>
          )}
        </div>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <XPBar totalXP={stats.totalXP} />
      </Card>

      {pendingHw.length > 0 && (
        <section className={styles.section}>
          <h2 className="section-title">Homework Due</h2>
          <div className={styles.hwList}>
            {pendingHw.map(hw => {
              const overdue = hw.dueDate && hw.dueDate < today
              return (
                <Card key={hw.id} className={styles.hwCard} onClick={() => navigate(`/homework/${hw.id}`)}>
                  <div className={styles.hwTitle}>{hw.title}</div>
                  <div className={styles.hwMeta}>
                    {hw.dueDate && (
                      <span className={overdue ? styles.overdue : styles.due}>
                        {overdue ? '⚠ OVERDUE · ' : ''}Due {hw.dueDate}
                      </span>
                    )}
                    <span className={styles.arrow}>→</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className="section-title">My Modules</h2>
        {myModules.length === 0 ? (
          <div className="empty-state">
            <p>No modules assigned yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid-2">
            {myModules.map(mod => {
              const lessons = getLessons().filter(l => mod.lessonIds.includes(l.id))
              const done = lessons.filter(l => completions.some(c => c.lessonId === l.id)).length
              return (
                <Card key={mod.id} onClick={() => navigate(`/modules/${mod.id}`)} className={styles.modCard}>
                  <div className={styles.modTitle}>{mod.title}</div>
                  <div className={styles.modMeta}>
                    {done}/{lessons.length} lessons done
                  </div>
                  {lessons.length > 0 && (
                    <div className={styles.modBar}>
                      <div className={styles.modFill} style={{ width: `${Math.round(done / lessons.length * 100)}%` }} />
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
