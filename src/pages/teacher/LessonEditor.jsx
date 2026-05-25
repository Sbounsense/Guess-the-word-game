import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './LessonEditor.module.css'

export default function LessonEditor() {
  const { lessonId } = useParams()
  const { getLessons, saveLesson, getDecks } = useData()
  const navigate = useNavigate()

  const lesson = getLessons().find(l => l.id === lessonId)
  if (!lesson) return <div className="page"><p>Lesson not found.</p></div>

  const [title, setTitle] = useState(lesson.title)
  const [content, setContent] = useState(lesson.content)
  const [deckId, setDeckId] = useState(lesson.deckId || '')

  const decks = getDecks()

  const handleSave = (e) => {
    e.preventDefault()
    saveLesson({ ...lesson, title, content, deckId: deckId || null })
    navigate(`/teacher/modules/${lesson.moduleId}`)
  }

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate(`/teacher/modules/${lesson.moduleId}`)}>← Module</button>
      <h1 className="page-title">Edit Lesson</h1>

      <form onSubmit={handleSave}>
        <Card style={{ marginBottom: 20 }}>
          <div className={styles.field}>
            <label className={styles.label}>Lesson title</label>
            <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className={styles.field} style={{ marginTop: 16 }}>
            <label className={styles.label}>Content</label>
            <textarea
              className={styles.textarea}
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={10}
              placeholder="Write lesson content. Use **bold** for headings and - for bullet points."
            />
            <span className={styles.hint}>Supports: **Bold** and - bullet points</span>
          </div>

          <div className={styles.field} style={{ marginTop: 16 }}>
            <label className={styles.label}>Attach a practice deck (optional)</label>
            <select className={styles.select} value={deckId} onChange={e => setDeckId(e.target.value)}>
              <option value="">— No deck —</option>
              {decks.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
        </Card>

        <Button type="submit" variant="primary">Save Lesson</Button>
      </form>
    </div>
  )
}
