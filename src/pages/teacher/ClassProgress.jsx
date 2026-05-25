import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { storage } from '../../services/storage.js'
import Card from '../../components/ui/Card.jsx'
import styles from './ClassProgress.module.css'

export default function ClassProgress() {
  const { currentUser } = useAuth()
  const { getUsers, getModules, getSubmissions, getHomework } = useData()
  const navigate = useNavigate()

  const students = getUsers().filter(u => u.role === 'student' && u.active !== false)
  const progress = storage.getProgress()
  const submissions = getSubmissions()
  const myHomework = getHomework().filter(h => h.createdBy === currentUser.id)

  return (
    <div className="page">
      <h1 className="page-title">Class Progress</h1>

      {students.length === 0 ? (
        <div className="empty-state"><p>No students yet.</p></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Sessions</th>
                <th>Avg Accuracy</th>
                <th>Homework Done</th>
                <th>Total XP</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const sp = progress.filter(p => p.userId === s.id)
                const avgAcc = sp.length
                  ? Math.round(sp.reduce((acc, p) => acc + (p.score / p.total) * 100, 0) / sp.length)
                  : null
                const hwDone = submissions.filter(sub => sub.studentId === s.id).length
                const hwTotal = myHomework.filter(h => h.assignedTo.includes(s.id)).length
                const g = storage.getUserGamification(s.id)

                return (
                  <tr key={s.id} onClick={() => navigate(`/teacher/students/${s.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className={styles.studentCell}>
                        <span className={styles.avatar} style={{ background: s.avatarColor }}>{s.name[0]}</span>
                        {s.name}
                      </div>
                    </td>
                    <td>{sp.length}</td>
                    <td>{avgAcc !== null ? `${avgAcc}%` : '—'}</td>
                    <td>{hwDone} / {hwTotal}</td>
                    <td className={styles.xp}>{g.totalXP || 0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
