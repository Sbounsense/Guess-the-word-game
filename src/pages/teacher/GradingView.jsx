import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import styles from './GradingView.module.css'

export default function GradingView() {
  const { hwId } = useParams()
  const { getHomework, getUsers, getSubmissions, updateSubmission, saveSubmission } = useData()
  const navigate = useNavigate()

  const hw = getHomework().find(h => h.id === hwId)
  const allSubs = getSubmissions()

  const [grades, setGrades] = useState({})
  const [saved, setSaved] = useState({})

  if (!hw) return <div className="page"><p>Homework not found.</p></div>

  const assignedStudents = getUsers().filter(u => hw.assignedTo.includes(u.id))

  const getStudentSub = (studentId) => allSubs.find(s => s.homeworkId === hwId && s.studentId === studentId)

  const getGradeState = (studentId) => grades[studentId] || {}

  const updateGrade = (studentId, field, value) => {
    setGrades(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }))
    setSaved(prev => ({ ...prev, [studentId]: false }))
  }

  const handleSave = (studentId) => {
    const sub = getStudentSub(studentId)
    const g = grades[studentId] || {}
    if (sub) {
      updateSubmission(sub.id, {
        teacherScore: g.teacherScore !== undefined ? Number(g.teacherScore) : sub.teacherScore,
        feedback: g.feedback !== undefined ? g.feedback : sub.feedback,
      })
    } else {
      saveSubmission({
        homeworkId: hwId,
        studentId,
        answer: null,
        score: null,
        total: null,
        teacherScore: g.teacherScore !== undefined ? Number(g.teacherScore) : null,
        feedback: g.feedback || '',
      })
    }
    setSaved(prev => ({ ...prev, [studentId]: true }))
  }

  const statusLabel = (sub) => {
    if (!sub) return { text: 'Not submitted', cls: styles.statusNone }
    if (sub.teacherScore !== undefined && sub.teacherScore !== null) return { text: 'Graded', cls: styles.statusGraded }
    return { text: 'Submitted', cls: styles.statusSub }
  }

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate('/teacher')}>← Dashboard</button>
      <h1 className="page-title">Grade: {hw.title}</h1>
      <p className={styles.sub}>
        {hw.assignedTo.length} students assigned · Due {hw.dueDate || 'No deadline'}
      </p>

      {assignedStudents.length === 0 ? (
        <div className="empty-state"><p>No students assigned.</p></div>
      ) : (
        <div className={styles.list}>
          {assignedStudents.map(student => {
            const sub = getStudentSub(student.id)
            const g = getGradeState(student.id)
            const status = statusLabel(sub)
            const currentScore = g.teacherScore !== undefined ? g.teacherScore : (sub?.teacherScore ?? '')
            const currentFeedback = g.feedback !== undefined ? g.feedback : (sub?.feedback || '')

            return (
              <Card key={student.id} className={styles.studentCard}>
                <div className={styles.studentHeader}>
                  <div className={styles.nameCell}>
                    <span className={styles.avatar} style={{ background: student.avatarColor }}>{student.name[0]}</span>
                    <span>{student.name}</span>
                  </div>
                  <span className={`${styles.status} ${status.cls}`}>{status.text}</span>
                </div>

                {sub && (
                  <div className={styles.submissionInfo}>
                    {sub.answer && (
                      <div className={styles.answer}>
                        <span className={styles.answerLabel}>Answer:</span>
                        <span className={styles.answerText}>{sub.answer}</span>
                      </div>
                    )}
                    {sub.score !== null && sub.total !== null && (
                      <div className={styles.gameScore}>
                        Game score: <strong>{sub.score}/{sub.total}</strong> ({Math.round(sub.score / sub.total * 100)}%)
                      </div>
                    )}
                  </div>
                )}

                {!sub && (
                  <p className={styles.noSub}>Student has not submitted yet.</p>
                )}

                <div className={styles.gradeRow}>
                  <div className={styles.gradeField}>
                    <label className={styles.gradeLabel}>Score (0–100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={styles.scoreInput}
                      value={currentScore}
                      onChange={e => updateGrade(student.id, 'teacherScore', e.target.value)}
                      placeholder="—"
                    />
                  </div>
                  <div className={styles.gradeField} style={{ flex: 2 }}>
                    <label className={styles.gradeLabel}>Feedback</label>
                    <input
                      type="text"
                      className={styles.feedbackInput}
                      value={currentFeedback}
                      onChange={e => updateGrade(student.id, 'feedback', e.target.value)}
                      placeholder="Leave a comment for the student…"
                    />
                  </div>
                  <button
                    className={`${styles.saveBtn} ${saved[student.id] ? styles.saveBtnDone : ''}`}
                    onClick={() => handleSave(student.id)}
                  >
                    {saved[student.id] ? '✓ Saved' : 'Save'}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Button variant="secondary" onClick={() => navigate('/teacher')}>← Back to Dashboard</Button>
      </div>
    </div>
  )
}
