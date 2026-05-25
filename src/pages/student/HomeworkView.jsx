import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './HomeworkView.module.css'

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

  const handleSubmitText = (e) => {
    e.preventDefault()
    saveSubmission({ homeworkId, studentId: currentUser.id, answer: textAnswer, score: null, total: null })
    setSubmitted(true)
  }

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate('/student')}>← Dashboard</button>
      <h1 className="page-title">{hw.title}</h1>
      {hw.dueDate && <p className={styles.due}>Due: {hw.dueDate}</p>}

      <Card className={styles.instructions}>
        <h3>Instructions</h3>
        <p>{hw.instructions}</p>
      </Card>

      {submitted ? (
        <Card className={styles.doneCard}>
          <span className={styles.doneIcon}>✅</span>
          <div>
            <div className={styles.doneTitle}>Homework submitted!</div>
            <div className={styles.doneSub}>Your teacher will review it.</div>
          </div>
        </Card>
      ) : (
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
      )}
    </div>
  )
}
