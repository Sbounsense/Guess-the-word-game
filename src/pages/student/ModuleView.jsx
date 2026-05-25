import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './ModuleView.module.css'

export default function ModuleView() {
  const { moduleId } = useParams()
  const { getModules, getLessons, getCompletions } = useData()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const mod = getModules().find(m => m.id === moduleId)
  if (!mod) return <div className="page"><p>Module not found.</p></div>

  const lessons = mod.lessonIds
    .map(id => getLessons().find(l => l.id === id))
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)

  const completions = getCompletions(currentUser.id)
  const doneCount = lessons.filter(l => completions.some(c => c.lessonId === l.id)).length
  const pct = lessons.length ? Math.round(doneCount / lessons.length * 100) : 0

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate('/student')}>← Back</button>
      <div className={styles.titleRow}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{mod.title}</h1>
        {lessons.length > 0 && (
          <span className={styles.progress}>{doneCount}/{lessons.length} done</span>
        )}
      </div>
      {lessons.length > 0 && (
        <div className={styles.progressBarWrap}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
          <span className={styles.pct}>{pct}%</span>
        </div>
      )}

      <div className={styles.list}>
        {lessons.map((lesson, i) => {
          const done = completions.some(c => c.lessonId === lesson.id)
          return (
            <Card key={lesson.id} className={`${styles.lessonCard} ${done ? styles.doneCard : ''}`} onClick={() => navigate(`/modules/${moduleId}/lessons/${lesson.id}`)}>
              <div className={styles.num}>{done ? <span className={styles.check}>✓</span> : i + 1}</div>
              <div className={styles.info}>
                <div className={styles.title}>{lesson.title}</div>
                {lesson.deckId && <span className={styles.hasDeck}>📖 Practice included</span>}
                {lesson.videoUrl && <span className={styles.hasVideo}>▶ Video</span>}
              </div>
              <span className={styles.arrow}>→</span>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
