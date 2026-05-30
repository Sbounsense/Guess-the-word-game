import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { genId } from '../../utils/id.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './HomeworkEditor.module.css'

const TASK_TYPES = [
  { value: 'text',      label: 'Written Answer',   icon: '✏️',  desc: 'Student types a written response' },
  { value: 'photo',     label: 'Photo Submission',  icon: '📸',  desc: 'Student uploads a photo' },
  { value: 'voice',     label: 'Voice Message',     icon: '🎙️', desc: 'Student records a voice message' },
  { value: 'flashcard', label: 'Flashcard Practice',icon: '🃏',  desc: 'Student practices with a deck' },
  { value: 'quiz',      label: 'Quiz',              icon: '🧠',  desc: 'Student answers multiple-choice questions' },
]

export default function HomeworkEditor() {
  const { currentUser } = useAuth()
  const { saveHomework, getHomework, getModules, getDecks, getUsers, getGroups, uploadFile } = useData()
  const { homeworkId } = useParams()
  const navigate = useNavigate()

  const existing = homeworkId ? getHomework().find(h => h.id === homeworkId) : null

  const [title, setTitle]             = useState(existing?.title || '')
  const [instructions, setInstructions] = useState(existing?.instructions || '')
  const [taskType, setTaskType]       = useState(existing?.task_type || 'text')
  const [moduleId, setModuleId]       = useState(existing?.moduleId || '')
  const [deckId, setDeckId]           = useState(existing?.deckId || '')
  const [dueDate, setDueDate]         = useState(existing?.dueDate || '')
  const [assignedTo, setAssignedTo]   = useState(existing?.assignedTo || [])
  const [groupIds, setGroupIds]       = useState(existing?.group_ids || [])
  const [pdfFile, setPdfFile]         = useState(null)
  const [pdfUrl, setPdfUrl]           = useState(existing?.pdf_url || '')
  const [questions, setQuestions]     = useState(existing?.questions || [])
  const [uploading, setUploading]     = useState(false)
  const [formError, setFormError]     = useState('')

  const modules  = getModules()
  const decks    = getDecks()
  const students = getUsers().filter(u => u.role === 'student' && u.active !== false)
  const groups   = getGroups()

  const toggleStudent = (id) =>
    setAssignedTo(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  const toggleGroup = (id) =>
    setGroupIds(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])

  // Quiz question management
  const addQuestion = () => setQuestions(prev => [...prev, { id: genId('q'), text: '', options: ['', '', '', ''], correct: 0 }])
  const updateQuestion = (idx, field, val) =>
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: val } : q))
  const updateOption = (qIdx, oIdx, val) =>
    setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, options: q.options.map((o, j) => j === oIdx ? val : o) } : q))
  const removeQuestion = (idx) => setQuestions(prev => prev.filter((_, i) => i !== idx))

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')

    if (taskType === 'flashcard' && !deckId) {
      setFormError('Please select a practice deck for flashcard homework.')
      return
    }
    if (taskType === 'quiz' && questions.length === 0) {
      setFormError('Add at least one quiz question before saving.')
      return
    }

    setUploading(true)

    let finalPdfUrl = pdfUrl
    if (pdfFile) {
      const safeName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `hw-${genId('pdf')}-${safeName}`
      finalPdfUrl = await uploadFile('homework-files', pdfFile, path) || pdfUrl
    }

    await saveHomework({
      id: existing?.id || genId('hw'),
      title,
      instructions,
      task_type: taskType,
      moduleId: moduleId || null,
      deckId: taskType === 'flashcard' ? (deckId || null) : null,
      dueDate: dueDate || null,
      assignedTo,
      group_ids: groupIds,
      pdf_url: finalPdfUrl || null,
      questions: taskType === 'quiz' ? questions : [],
      createdBy: currentUser.id,
    })
    setUploading(false)
    navigate('/teacher')
  }

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate('/teacher')}>← Back</button>
      <h1 className="page-title">{existing ? 'Edit Homework' : 'New Homework'}</h1>

      <form onSubmit={handleSave}>
        {formError && (
          <div style={{ color: 'var(--error, #f44)', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.88rem' }}>
            {formError}
          </div>
        )}

        {/* Basic info */}
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
              <label className={styles.label}>Due date</label>
              <input className={styles.input} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
        </Card>

        {/* Task type */}
        <Card style={{ marginBottom: 20 }}>
          <h3 className={styles.sectionTitle}>Task Type</h3>
          <div className={styles.taskTypeGrid}>
            {TASK_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                className={`${styles.taskTypeBtn} ${taskType === t.value ? styles.taskTypeActive : ''}`}
                onClick={() => setTaskType(t.value)}
              >
                <span className={styles.taskTypeIcon}>{t.icon}</span>
                <span className={styles.taskTypeName}>{t.label}</span>
                <span className={styles.taskTypeDesc}>{t.desc}</span>
              </button>
            ))}
          </div>

          {taskType === 'flashcard' && (
            <div className={styles.field} style={{ marginTop: 16 }}>
              <label className={styles.label}>Practice deck</label>
              <select className={styles.select} value={deckId} onChange={e => setDeckId(e.target.value)}>
                <option value="">— Select a deck —</option>
                {decks.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
          )}
        </Card>

        {/* Quiz questions */}
        {taskType === 'quiz' && (
          <Card style={{ marginBottom: 20 }}>
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Quiz Questions</h3>
              <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>+ Add Question</Button>
            </div>
            {questions.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No questions yet. Add at least one.</p>
            )}
            {questions.map((q, qi) => (
              <div key={q.id} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <span className={styles.questionNum}>Q{qi + 1}</span>
                  <button type="button" className={styles.removeBtn} onClick={() => removeQuestion(qi)}>✕</button>
                </div>
                <input
                  className={styles.input}
                  value={q.text}
                  onChange={e => updateQuestion(qi, 'text', e.target.value)}
                  placeholder="Question text"
                  style={{ marginBottom: 10 }}
                />
                {q.options.map((opt, oi) => (
                  <div key={oi} className={styles.optionRow}>
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correct === oi}
                      onChange={() => updateQuestion(qi, 'correct', oi)}
                      title="Mark as correct answer"
                    />
                    <input
                      className={styles.input}
                      value={opt}
                      onChange={e => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      style={{ flex: 1 }}
                    />
                    {q.correct === oi && <span className={styles.correctBadge}>✓ Correct</span>}
                  </div>
                ))}
              </div>
            ))}
          </Card>
        )}

        {/* PDF attachment */}
        <Card style={{ marginBottom: 20 }}>
          <h3 className={styles.sectionTitle}>PDF Attachment (optional)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 10 }}>
            Attach a PDF document students can download (e.g. reading material, worksheet).
          </p>
          {pdfUrl && (
            <div className={styles.existingFile}>
              <span>📎</span>
              <a href={pdfUrl} target="_blank" rel="noreferrer" className={styles.fileLink}>Current PDF</a>
              <button type="button" className={styles.removeBtn} onClick={() => setPdfUrl('')}>Remove</button>
            </div>
          )}
          <input
            type="file"
            accept="application/pdf"
            className={styles.fileInput}
            onChange={e => setPdfFile(e.target.files[0] || null)}
          />
        </Card>

        {/* Assign to groups */}
        <Card style={{ marginBottom: 20 }}>
          <h3 className={styles.sectionTitle}>Assign to Groups</h3>
          {groups.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No groups yet. Ask an admin to create groups.</p>
          ) : (
            <div className={styles.groupList}>
              {groups.map(g => (
                <label key={g.id} className={styles.studentChk}>
                  <input type="checkbox" checked={groupIds.includes(g.id)} onChange={() => toggleGroup(g.id)} />
                  <span className={styles.groupChip}>👥</span>
                  <span>{g.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({(g.student_ids || []).length} students)</span>
                </label>
              ))}
            </div>
          )}
        </Card>

        {/* Assign to individual students */}
        <Card style={{ marginBottom: 20 }}>
          <h3 className={styles.sectionTitle}>Assign to Individual Students</h3>
          <div className={styles.studentList}>
            {students.length === 0 && <span className={styles.noStudents}>No students yet.</span>}
            {students.map(s => (
              <label key={s.id} className={styles.studentChk}>
                <input type="checkbox" checked={assignedTo.includes(s.id)} onChange={() => toggleStudent(s.id)} />
                <span className={styles.sAvatar} style={{ background: s.avatarColor }}>{(s.name || '?')[0]}</span>
                {s.name}
              </label>
            ))}
          </div>
        </Card>

        <Button type="submit" variant="primary" disabled={uploading}>
          {uploading ? 'Saving…' : existing ? 'Save Homework' : 'Create Homework'}
        </Button>
      </form>
    </div>
  )
}
