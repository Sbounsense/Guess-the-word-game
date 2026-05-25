import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './HomeworkView.module.css'

const today = new Date().toISOString().slice(0, 10)

export default function HomeworkView() {
  const { homeworkId } = useParams()
  const { getHomework, getDeck, getSubmissions, saveSubmission } = useData()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const hw = getHomework().find(h => h.id === homeworkId)
  const existing = getSubmissions().find(s => s.homeworkId === homeworkId && s.studentId === currentUser.id)
  const deck = hw?.deckId ? getDeck(hw.deckId) : null

  const [textAnswer, setTextAnswer] = useState('')
  const [submitted, setSubmitted] = useState(!!existing)

  if (!hw) return <div className="page"><p>Homework not found.</p></div>

  const overdue = hw.dueDate && hw.dueDate < today
  const isGraded = existing && (existing.teacherScore !== undefined && existing.teacherScore !== null)
  const isAwaitingReview = existing && !isGraded

  const handleSubmitText = (e) => {
    e.preventDefault()
    saveSubmission({ homeworkId, studentId: currentUser.id, answer: textAnswer, score: null, total: null })
    setSubmitted(true)
  }

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate('/student')}>← Dashboard</button>
      <h1 className="page-title">{hw.title}</h1>
      {hw.dueDate && (
        <p className={overdue ? styles.overdue : styles.due}>
          {overdue ? '⚠ OVERDUE · ' : ''}Due: {hw.dueDate}
        </p>
      )}

      <Card className={styles.instructions}>
        <h3>Instructions</h3>
        <p>{hw.instructions}</p>
      </Card>

      {isGraded && (
        <Card className={styles.gradeCard}>
          <div className={styles.gradeHeader}>
            <span className={styles.gradeIcon}>🎓</span>
            <div>
              <div className={styles.gradeTitle}>Your Grade</div>
              <div className={styles.gradeScore}>{existing.teacherScore}/100</div>
            </div>
          </div>
          {existing.feedback && (
            <div className={styles.feedback}>
              <span className={styles.feedbackLabel}>Teacher's feedback:</span>
              <p className={styles.feedbackText}>{existing.feedback}</p>
            </div>
          )}
        </Card>
      )}

      {isAwaitingReview && (
        <Card className={styles.awaitingCard}>
          <span className={styles.awaitingIcon}>⏳</span>
          <div>
            <div className={styles.awaitingTitle}>Awaiting review</div>
            <div className={styles.awaitingSub}>Your teacher will grade this soon.</div>
          </div>
        </Card>
      )}

      {!submitted ? (
        <>
          {deck && (
            <Card className={styles.deckCard}>
              <div className={styles.deckInfo}>
                <span className={styles.deckIcon}>📖</span>
                <div>
                  <div className={styles.deckTitle}>{deck.title}</div>
                  <div className={styles.deckCount}>{deck.cards.length} cards</div>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate(`/study/${deck.id}?from=/homework/${homeworkId}`)}
              >
                Play Game →
              </Button>
            </Card>
          )}

          {!deck && (
            <form className={styles.form} onSubmit={handleSubmitText}>
              <label className={styles.label}>Your answer</label>
              <textarea
                className={styles.textarea}
                value={textAnswer}
                onChange={e => setTextAnswer(e.target.value)}
                placeholder="Write your answer here…"
                rows={5}
                required
              />
              <Button type="submit" variant="primary" disabled={!textAnswer.trim()}>
                Submit Homework
              </Button>
            </form>
          )}
        </>
      ) : !isGraded && !isAwaitingReview && (
        <Card className={styles.doneCard}>
          <span className={styles.doneIcon}>✅</span>
          <div>
            <div className={styles.doneTitle}>Homework submitted!</div>
            <div className={styles.doneSub}>Your teacher will review it.</div>
          </div>
        </Card>
      )}
    </div>
  )
}
