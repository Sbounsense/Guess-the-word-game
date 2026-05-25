import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { toEmbedUrl } from '../../utils/embedUrl.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './LessonView.module.css'

export default function LessonView() {
  const { moduleId, lessonId } = useParams()
  const { getLessons, getDeck, getCompletions, completeLesson } = useData()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const lesson = getLessons().find(l => l.id === lessonId)
  if (!lesson) return <div className="page"><p>Lesson not found.</p></div>

  const deck = lesson.deckId ? getDeck(lesson.deckId) : null
  const completions = getCompletions(currentUser.id)
  const isComplete = completions.some(c => c.lessonId === lessonId)

  const embedUrl = toEmbedUrl(lesson.videoUrl)

  const paragraphs = lesson.content?.split('\n').filter(Boolean) || []

  const handleComplete = () => {
    completeLesson(currentUser.id, lessonId)
  }

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate(`/modules/${moduleId}`)}>← Module</button>
      <div className={styles.titleRow}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{lesson.title}</h1>
        {isComplete && <span className={styles.completedBadge}>✓ Completed</span>}
      </div>

      {embedUrl && (
        <div className={styles.videoWrap}>
          <div className={styles.videoLabel}>Video Lesson</div>
          <div className={styles.videoFrame}>
            <iframe
              src={embedUrl}
              title="Video lesson"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

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

      {lesson.pdfUrl && (
        <Card className={styles.pdfCard}>
          <span className={styles.pdfIcon}>📄</span>
          <div className={styles.pdfInfo}>
            <div className={styles.pdfTitle}>PDF Attachment</div>
            <button
              className={styles.pdfBtn}
              onClick={() => window.open(lesson.pdfUrl, '_blank')}
            >
              View / Download PDF
            </button>
          </div>
        </Card>
      )}

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

      {!isComplete && (
        <div className={styles.completeWrap}>
          <Button variant="primary" onClick={handleComplete}>
            ✓ Mark as Complete
          </Button>
        </div>
      )}
    </div>
  )
}
