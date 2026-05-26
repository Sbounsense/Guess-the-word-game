import { useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import styles from './UserManager.module.css'

export default function UserManager() {
  const { getUsers, saveUser, deactivateUser } = useData()
  const [editUser, setEditUser] = useState(null)
  const [editRole, setEditRole] = useState('student')

  const users = getUsers()

  const openEdit = (u) => { setEditUser(u); setEditRole(u.role) }

  const handleSaveRole = async (e) => {
    e.preventDefault()
    await saveUser({ ...editUser, role: editRole })
    setEditUser(null)
  }

  return (
    <div className="page">
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>User Management</h1>
      </div>
      <p className={styles.hint}>Users create their own accounts via the Sign Up page. Manage their roles and status here.</p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Name</th><th>Email / ID</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No users yet — they sign up at the login page.</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className={styles.nameCell}>
                    <span className={styles.avatar} style={{ background: u.avatarColor }}>{u.name[0]}</span>
                    {u.name}
                  </div>
                </td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.id.slice(0, 8)}…</td>
                <td><span className={`badge-chip chip-${u.role}`}>{u.role}</span></td>
                <td>
                  <span className={u.active !== false ? styles.active : styles.inactive}>
                    {u.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className={styles.deactivate} style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }} onClick={() => openEdit(u)}>
                      Change Role
                    </button>
                    {u.active !== false && (
                      <button className={styles.deactivate} onClick={() => {
                        if (window.confirm(`Deactivate ${u.name}?`)) deactivateUser(u.id)
                      }}>Deactivate</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && (
        <Modal title={`Change role — ${editUser.name}`} onClose={() => setEditUser(null)}>
          <form onSubmit={handleSaveRole} className={styles.form}>
            <div className={styles.roleGroup}>
              {['student','teacher','admin'].map(r => (
                <button key={r} type="button"
                  className={`${styles.roleBtn} ${editRole === r ? styles.roleActive : ''}`}
                  onClick={() => setEditRole(r)}>
                  {r}
                </button>
              ))}
            </div>
            <Button type="submit" variant="primary" style={{ marginTop: 16, width: '100%' }}>Save Role</Button>
          </form>
        </Modal>
      )}
    </div>
  )
}
