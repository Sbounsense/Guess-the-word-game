import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { genId } from '../../utils/id.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './ModuleEditor.module.css'

export default function ModuleEditor() {
  const { moduleId } = useParams()
  const { currentUser } = useAuth()
  const { getModules, saveModule, deleteModule, getLessons, saveLesson, deleteLesson, getSubjects, getUsers } = useData()
  const navigate = useNavigate()

  const isNew = !moduleId || moduleId === 'new'
  const existing = isNew ? null : getModules().find(m => m.id === moduleId)
  const newModId = existing?.id || genId('mod')

  const [title, setTitle] = useState(existing?.title || '')
  const [subjectId, setSubjectId] = useState(existing?.subjectId || 'custom')
  const [assignedTo, setAssignedTo] = useState(existing?.assignedTo || [])
  const [newLessonTitle, setNewLessonTitle] = useState('')

  const subjects = getSubjects()
  const students = getUsers().filter(u => u.role === 'student' && u.active !== false)
  const lessons = getLessons()
    .filter(l => l.moduleId === (existing?.id || ''))
    .sort((a, b) => a.order - b.order)

  const toggleStudent = (id) => {
    setAssignedTo(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const handleSave = (e) => {
    e.preventDefault()
    saveModule({
      id: existing?.id || newModId,
      title,
      subjectId,
      createdBy: currentUser.id,
      lessonIds: existing?.lessonIds || [],
      assignedTo,
    })
    navigate('/teacher')
  }

  const handleAddLesson = (e) => {
    e.preventDefault()
    if (!newLessonTitle.trim() || isNew) return
    saveLesson({
      id: genId('les'),
      moduleId: existing.id,
      title: newLessonTitle.trim(),
      content: '',
      deckId: null,
      order: lessons.length + 1,
    })
    setNewLessonTitle('')
  }

  const handleDeleteLesson = (id) => {
    if (window.confirm('Delete this lesson?')) deleteLesson(id)
  }

  const handleDelete = () => {
    if (window.confirm('Delete this module?')) {
      deleteModule(existing.id)
      navigate('/teacher')
    }
  }

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate('/teacher')}>← Back</button>
      <h1 className="page-title">{isNew ? 'New Module' : 'Edit Module'}</h1>

      <form onSubmit={handleSave}>
        <Card style={{ marginBottom: 20 }}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Module title</label>
              <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. English Vocabulary — Level 1" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Subject</label>
              <select className={styles.select} value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.field} style={{ marginTop: 16 }}>
            <label className={styles.label}>Assign to students</label>
            <div className={styles.studentList}>
              {students.length === 0 && <span className={styles.noStudents}>No students yet.</span>}
              {students.map(s => (
                <label key={s.id} className={styles.studentChk}>
                  <input
                    type="checkbox"
                    checked={assignedTo.includes(s.id)}
                    onChange={() => toggleStudent(s.id)}
                  />
                  <span className={styles.sAvatar} style={{ background: s.avatarColor }}>{s.name[0]}</span>
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        </Card>

        <div className={styles.formActions} style={{ marginBottom: 32 }}>
          <Button type="submit" variant="primary">Save Module</Button>
          {!isNew && <Button type="button" variant="danger" onClick={handleDelete}>Delete Module</Button>}
        </div>
      </form>

      {!isNew && (
        <section>
          <h2 className="section-title">Lessons</h2>
          <div className={styles.lessonList}>
            {lessons.map((l, i) => (
              <Card key={l.id} className={styles.lessonRow}>
                <span className={styles.lessonNum}>{i + 1}</span>
                <span className={styles.lessonTitle}>{l.title}</span>
                <div className={styles.lessonActions}>
                  <button className={styles.editBtn} onClick={() => navigate(`/teacher/lessons/${l.id}/edit`)}>Edit</button>
                  <button className={styles.delBtn} onClick={() => handleDeleteLesson(l.id)}>✕</button>
                </div>
              </Card>
            ))}
          </div>
          <form className={styles.addLesson} onSubmit={handleAddLesson}>
            <input
              className={styles.input}
              value={newLessonTitle}
              onChange={e => setNewLessonTitle(e.target.value)}
              placeholder="New lesson title…"
            />
            <Button type="submit" variant="secondary" size="sm">Add Lesson</Button>
          </form>
        </section>
      )}
    </div>
  )
}
