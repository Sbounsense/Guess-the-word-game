import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './ModuleView.module.css'

export default function ModuleView() {
  const { moduleId } = useParams()
  const { getModules, getLessons } = useData()
  const navigate = useNavigate()

  const mod = getModules().find(m => m.id === moduleId)
  if (!mod) return <div className="page"><p>Module not found.</p></div>

  const lessons = mod.lessonIds
    .map(id => getLessons().find(l => l.id === id))
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate('/student')}>← Back</button>
      <h1 className="page-title">{mod.title}</h1>
      <p className={styles.meta}>{lessons.length} lessons</p>

      <div className={styles.list}>
        {lessons.map((lesson, i) => (
          <Card key={lesson.id} className={styles.lessonCard} onClick={() => navigate(`/modules/${moduleId}/lessons/${lesson.id}`)}>
            <div className={styles.num}>{i + 1}</div>
            <div className={styles.info}>
              <div className={styles.title}>{lesson.title}</div>
              {lesson.deckId && <span className={styles.hasDeck}>📖 Practice included</span>}
            </div>
            <span className={styles.arrow}>→</span>
          </Card>
        ))}
      </div>
    </div>
  )
}
