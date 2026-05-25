import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { storage } from '../../services/storage.js'
import { calcLevel } from '../../utils/gamification.js'
import Card from '../../components/ui/Card.jsx'
import styles from './StudentDetail.module.css'

export default function StudentDetail() {
  const { studentId } = useParams()
  const { getUsers, getModules, getLessons, getHomework, getSubmissions, getCompletions } = useData()
  const navigate = useNavigate()

  const student = getUsers().find(u => u.id === studentId)
  if (!student) return <div className="page"><p>Student not found.</p></div>

  const g = storage.getUserGamification(studentId)
  const lvl = calcLevel(g.totalXP)

  const modules = getModules().filter(m => m.assignedTo?.includes(studentId))
  const lessons = getLessons()
  const completions = getCompletions(studentId)
  const homework = getHomework().filter(h => h.assignedTo?.includes(studentId))
  const submissions = getSubmissions().filter(s => s.studentId === studentId)
  const sessions = storage.getProgress().filter(p => p.userId === studentId)
    .sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate))
    .slice(0, 10)

  const allDecks = storage.getDecks()

  const hwStatus = (hw) => {
    const sub = submissions.find(s => s.homeworkId === hw.id)
    if (!sub) return { text: 'Pending', cls: styles.pending }
    if (sub.teacherScore !== undefined && sub.teacherScore !== null) return { text: `Graded: ${sub.teacherScore}/100`, cls: styles.graded }
    return { text: 'Submitted', cls: styles.submitted }
  }

  const modeIcon = (mode) => ({ word_guess: '🔤', flashcard: '🃏', quiz: '❓' }[mode] || '📚')

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate('/teacher/progress')}>← Class Progress</button>

      {/* Header */}
      <Card className={styles.headerCard}>
        <div className={styles.headerInner}>
          <div className={styles.avatar} style={{ background: student.avatarColor }}>
            {student.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className={styles.name}>{student.name}</h1>
            <p className={styles.lvl}>Lv {lvl.level} {lvl.label} · {g.totalXP} XP · 🔥 {g.currentStreak} streak</p>
          </div>
        </div>
      </Card>

      {/* Modules */}
      <section className={styles.section}>
        <h2 className="section-title">Modules ({modules.length})</h2>
        {modules.length === 0 ? (
          <p className={styles.empty}>No modules assigned.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Module</th><th>Lessons Done</th><th>Progress</th></tr>
              </thead>
              <tbody>
                {modules.map(m => {
                  const modLessons = m.lessonIds.map(id => lessons.find(l => l.id === id)).filter(Boolean)
                  const done = modLessons.filter(l => completions.some(c => c.lessonId === l.id)).length
                  const pct = modLessons.length ? Math.round(done / modLessons.length * 100) : 0
                  return (
                    <tr key={m.id}>
                      <td>{m.title}</td>
                      <td>{done}/{modLessons.length}</td>
                      <td>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={styles.pct}>{pct}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Homework */}
      <section className={styles.section}>
        <h2 className="section-title">Homework ({homework.length})</h2>
        {homework.length === 0 ? (
          <p className={styles.empty}>No homework assigned.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Title</th><th>Due</th><th>Status</th></tr>
              </thead>
              <tbody>
                {homework.map(h => {
                  const st = hwStatus(h)
                  return (
                    <tr key={h.id}>
                      <td>{h.title}</td>
                      <td>{h.dueDate || '—'}</td>
                      <td><span className={`${styles.badge} ${st.cls}`}>{st.text}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Sessions */}
      <section className={styles.section}>
        <h2 className="section-title">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <p className={styles.empty}>No sessions yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Deck</th><th>Mode</th><th>Score</th><th>XP</th><th>Date</th></tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => {
                  const deck = allDecks.find(d => d.id === s.deckId)
                  return (
                    <tr key={i}>
                      <td>{deck?.title || s.deckId}</td>
                      <td>{modeIcon(s.mode)} {s.mode?.replace('_', ' ')}</td>
                      <td>{s.score}/{s.total} ({Math.round(s.score/s.total*100)}%)</td>
                      <td className={styles.xp}>+{s.xpEarned}</td>
                      <td>{s.sessionDate}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
