import { useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import { genId } from '../../utils/id.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import styles from './UserManager.module.css'

const COLORS = ['#ff7a7a','#4dabf7','#69db7c','#ffd43b','#cc5de8','#ff8c42','#38d9a9']

export default function UserManager() {
  const { getUsers, saveUser, deactivateUser } = useData()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('student')

  const users = getUsers()

  const handleCreate = (e) => {
    e.preventDefault()
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    saveUser({ id: genId('usr'), name: name.trim(), role, active: true, avatarColor: color, createdAt: new Date().toISOString() })
    setName('')
    setRole('student')
    setShowModal(false)
  }

  return (
    <div className="page">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>User Management</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ New User</Button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Name</th><th>Role</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className={styles.nameCell}>
                    <span className={styles.avatar} style={{ background: u.avatarColor }}>{u.name[0]}</span>
                    {u.name}
                  </div>
                </td>
                <td><span className={`badge-chip chip-${u.role}`}>{u.role}</span></td>
                <td>
                  <span className={u.active !== false ? styles.active : styles.inactive}>
                    {u.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {u.active !== false && u.role !== 'admin' && (
                    <button className={styles.deactivate} onClick={() => {
                      if (window.confirm(`Deactivate ${u.name}?`)) deactivateUser(u.id)
                    }}>Deactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="New User" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className={styles.form}>
            <label className={styles.label}>Full name</label>
            <input className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maria" required autoFocus />
            <label className={styles.label} style={{ marginTop: 10 }}>Role</label>
            <div className={styles.roleGroup}>
              {['student','teacher','admin'].map(r => (
                <button key={r} type="button"
                  className={`${styles.roleBtn} ${role === r ? styles.roleActive : ''}`}
                  onClick={() => setRole(r)}>
                  {r}
                </button>
              ))}
            </div>
            <Button type="submit" variant="primary" style={{ marginTop: 16, width: '100%' }}>Create User</Button>
          </form>
        </Modal>
      )}
    </div>
  )
}
