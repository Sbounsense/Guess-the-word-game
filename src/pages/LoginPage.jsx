import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { genId } from '../utils/id.js'
import Button from '../components/ui/Button.jsx'
import styles from './LoginPage.module.css'

const COLORS = ['#ff7a7a','#4dabf7','#69db7c','#ffd43b','#cc5de8','#ff8c42','#38d9a9']

export default function LoginPage() {
  const { login } = useAuth()
  const { getUsers, saveUser } = useData()
  const navigate = useNavigate()

  const [tab, setTab] = useState('existing')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('student')

  const users = getUsers().filter(u => u.active !== false)

  const handleSelectUser = (user) => {
    login(user)
    navigate(`/${user.role}`)
  }

  const handleCreate = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const newUser = {
      id: genId('usr'),
      name: newName.trim(),
      role: newRole,
      active: true,
      avatarColor: color,
      createdAt: new Date().toISOString(),
    }
    saveUser(newUser)
    login(newUser)
    navigate(`/${newRole}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🎓</div>
        <h1 className={styles.title}>EduQuest</h1>
        <p className={styles.sub}>Education Centre Platform</p>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'existing' ? styles.active : ''}`} onClick={() => setTab('existing')}>
            Sign In
          </button>
          <button className={`${styles.tab} ${tab === 'new' ? styles.active : ''}`} onClick={() => setTab('new')}>
            New Profile
          </button>
        </div>

        {tab === 'existing' && (
          <div className={styles.userList}>
            {users.length === 0 && (
              <p className={styles.empty}>No profiles yet. Create one!</p>
            )}
            {users.map(u => (
              <button key={u.id} className={styles.userBtn} onClick={() => handleSelectUser(u)}>
                <span className={styles.avatar} style={{ background: u.avatarColor }}>
                  {u.name[0].toUpperCase()}
                </span>
                <span className={styles.info}>
                  <span className={styles.userName}>{u.name}</span>
                  <span className={`badge-chip chip-${u.role}`}>{u.role}</span>
                </span>
                <span className={styles.arrow}>→</span>
              </button>
            ))}
          </div>
        )}

        {tab === 'new' && (
          <form className={styles.form} onSubmit={handleCreate}>
            <label className={styles.label}>Your name</label>
            <input
              className={styles.input}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Alex"
              autoFocus
              required
            />
            <label className={styles.label}>Role</label>
            <div className={styles.roleGroup}>
              {['student','teacher','admin'].map(r => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.roleBtn} ${newRole === r ? styles.roleActive : ''}`}
                  onClick={() => setNewRole(r)}
                >
                  {r === 'student' ? '🧑‍🎓' : r === 'teacher' ? '🧑‍🏫' : '⚙️'} {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            <Button type="submit" variant="primary" size="lg" style={{ width: '100%', marginTop: 8 }}>
              Create &amp; Enter
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
