import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { genId } from '../../utils/id.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './HomeworkEditor.module.css'

export default function HomeworkEditor() {
  const { currentUser } = useAuth()
  const { saveHomework, getModules, getDecks, getUsers } = useData()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [deckId, setDeckId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState([])

  const modules = getModules()
  const decks = getDecks()
  const students = getUsers().filter(u => u.role === 'student' && u.active !== false)

  const toggleStudent = (id) => setAssignedTo(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const handleSave = (e) => {
    e.preventDefault()
    saveHomework({
      id: genId('hw'),
      title,
      instructions,
      moduleId: moduleId || null,
      deckId: deckId || null,
      dueDate: dueDate || null,
      assignedTo,
      createdBy: currentUser.id,
    })
    navigate('/teacher')
  }

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate('/teacher')}>← Back</button>
      <h1 className="page-title">New Homework</h1>

      <form onSubmit={handleSave}>
        <Card style={{ marginBottom: 20 }}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Animals Vocabulary Practice" required />
          </div>

          <div className={styles.field} style={{ marginTop: 14 }}>
            <label className={styles.label}>Instructions</label>
            <textarea className={styles.textarea} value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="What should students do?" rows={3} />
          </div>

          <div className={styles.row} style={{ marginTop: 14 }}>
            <div className={styles.field}>
              <label className={styles.label}>Module (optional)</label>
              <select className={styles.select} value={moduleId} onChange={e => setModuleId(e.target.value)}>
                <option value="">— None —</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Practice deck (optional)</label>
              <select className={styles.select} value={deckId} onChange={e => setDeckId(e.target.value)}>
                <option value="">— Text answer only —</option>
                {decks.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Due date</label>
              <input className={styles.input} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className={styles.field} style={{ marginTop: 14 }}>
            <label className={styles.label}>Assign to students</label>
            <div className={styles.studentList}>
              {students.length === 0 && <span className={styles.noStudents}>No students yet.</span>}
              {students.map(s => (
                <label key={s.id} className={styles.studentChk}>
                  <input type="checkbox" checked={assignedTo.includes(s.id)} onChange={() => toggleStudent(s.id)} />
                  <span className={styles.sAvatar} style={{ background: s.avatarColor }}>{s.name[0]}</span>
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        </Card>

        <Button type="submit" variant="primary">Create Homework</Button>
      </form>
    </div>
  )
}
