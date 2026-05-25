import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './LessonView.module.css'

export default function LessonView() {
  const { moduleId, lessonId } = useParams()
  const { getLessons, getDeck } = useData()
  const navigate = useNavigate()

  const lesson = getLessons().find(l => l.id === lessonId)
  if (!lesson) return <div className="page"><p>Lesson not found.</p></div>

  const deck = lesson.deckId ? getDeck(lesson.deckId) : null

  const paragraphs = lesson.content.split('\n').filter(Boolean)

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate(`/modules/${moduleId}`)}>← Module</button>
      <h1 className="page-title">{lesson.title}</h1>

      <Card className={styles.content}>
        {paragraphs.map((p, i) => {
          if (p.startsWith('**') && p.endsWith('**')) {
            return <h3 key={i} className={styles.heading}>{p.slice(2, -2)}</h3>
          }
          if (p.startsWith('- ')) {
            return <li key={i} className={styles.li}>{p.slice(2)}</li>
          }
          return <p key={i} className={styles.para}>{p}</p>
        })}
      </Card>

      {deck && (
        <Card className={styles.practiceCard}>
          <div className={styles.practiceInfo}>
            <span className={styles.practiceIcon}>📖</span>
            <div>
              <div className={styles.practiceTitle}>Practice Deck: {deck.title}</div>
              <div className={styles.practiceCount}>{deck.cards.length} cards</div>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate(`/study/${deck.id}?from=/modules/${moduleId}/lessons/${lessonId}`)}
          >
            Study Deck →
          </Button>
        </Card>
      )}
    </div>
  )
}
