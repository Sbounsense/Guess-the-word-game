import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { storage } from '../../services/storage.js'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const { getUsers, getModules, getDecks, getSubjects } = useData()
  const navigate = useNavigate()

  const users = getUsers()
  const students = users.filter(u => u.role === 'student')
  const teachers = users.filter(u => u.role === 'teacher')
  const modules = getModules()
  const decks = getDecks()
  const subjects = getSubjects()

  return (
    <div className="page">
      <h1 className="page-title">⚙️ Admin Dashboard</h1>
      <p className={styles.sub}>Education Centre — Centre Overview</p>

      <div className="grid-3" style={{ marginBottom: 32 }}>
        {[
          { label: 'Students', val: students.length, icon: '🧑‍🎓' },
          { label: 'Teachers', val: teachers.length, icon: '🧑‍🏫' },
          { label: 'Modules', val: modules.length, icon: '📦' },
          { label: 'Decks', val: decks.length, icon: '🃏' },
          { label: 'Subjects', val: subjects.length, icon: '📚' },
        ].map(s => (
          <Card key={s.label}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statVal}>{s.val}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={() => navigate('/admin/users')}>Manage Users</Button>
        <Button variant="secondary" onClick={() => navigate('/admin/subjects')}>Manage Subjects</Button>
        <Button variant="secondary" onClick={() => navigate('/admin/reports')}>View Reports</Button>
      </div>
    </div>
  )
}
