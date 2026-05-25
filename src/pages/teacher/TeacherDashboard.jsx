import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import styles from './TeacherDashboard.module.css'

export default function TeacherDashboard() {
  const { currentUser } = useAuth()
  const { getModules, getDecks, getHomework, getLessons, getSubmissions, deleteHomework } = useData()
  const navigate = useNavigate()

  const myModules = getModules().filter(m => m.createdBy === currentUser.id)
  const myDecks = getDecks().filter(d => d.createdBy === currentUser.id)
  const myHomework = getHomework().filter(h => h.createdBy === currentUser.id)
  const allSubmissions = getSubmissions()

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (window.confirm('Delete this homework?')) deleteHomework(id)
  }

  return (
    <div className="page">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Teacher Dashboard</h1>
      </div>

      <div className="grid-3" style={{ marginBottom: 32 }}>
        <Card>
          <div className={styles.statVal}>{myModules.length}</div>
          <div className={styles.statLabel}>Modules</div>
        </Card>
        <Card>
          <div className={styles.statVal}>{myDecks.length}</div>
          <div className={styles.statLabel}>Decks</div>
        </Card>
        <Card>
          <div className={styles.statVal}>{myHomework.length}</div>
          <div className={styles.statLabel}>Homework Tasks</div>
        </Card>
      </div>

      <section className={styles.section}>
        <div className="flex-between" style={{ marginBottom: 12 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Modules</h2>
          <Button variant="primary" size="sm" onClick={() => navigate('/teacher/modules/new')}>+ New Module</Button>
        </div>
        {myModules.length === 0 ? (
          <div className="empty-state"><p>Create your first module to get started.</p></div>
        ) : (
          <div className="grid-2">
            {myModules.map(m => {
              const lessons = getLessons().filter(l => m.lessonIds.includes(l.id))
              return (
                <Card key={m.id} onClick={() => navigate(`/teacher/modules/${m.id}`)} className={styles.itemCard}>
                  <div className={styles.itemTitle}>{m.title}</div>
                  <div className={styles.itemMeta}>{lessons.length} lessons · {m.assignedTo?.length || 0} students</div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className="flex-between" style={{ marginBottom: 12 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Flashcard Decks</h2>
          <Button variant="primary" size="sm" onClick={() => navigate('/teacher/decks/new')}>+ New Deck</Button>
        </div>
        {myDecks.length === 0 ? (
          <div className="empty-state"><p>No decks yet.</p></div>
        ) : (
          <div className="grid-2">
            {myDecks.map(d => (
              <Card key={d.id} onClick={() => navigate(`/teacher/decks/${d.id}/edit`)} className={styles.itemCard}>
                <div className={styles.itemTitle}>{d.title}</div>
                <div className={styles.itemMeta}>{d.cards.length} cards</div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className="flex-between" style={{ marginBottom: 12 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Homework</h2>
          <Button variant="primary" size="sm" onClick={() => navigate('/teacher/homework/new')}>+ New Homework</Button>
        </div>
        {myHomework.length === 0 ? (
          <div className="empty-state"><p>No homework tasks yet.</p></div>
        ) : (
          <div className="grid-2">
            {myHomework.map(h => {
              const subs = allSubmissions.filter(s => s.homeworkId === h.id)
              const ungraded = subs.filter(s => s.score === null && s.submittedAt).length
              return (
                <Card key={h.id} className={styles.itemCard}>
                  <div className={styles.hwTop}>
                    <div className={styles.itemTitle}>{h.title}</div>
                    {ungraded > 0 && (
                      <span className={styles.ungradedBadge}>{ungraded} ungraded</span>
                    )}
                  </div>
                  <div className={styles.itemMeta}>Due {h.dueDate || 'No deadline'} · {h.assignedTo?.length || 0} students</div>
                  <div className={styles.hwActions}>
                    <button className={styles.hwBtn} onClick={() => navigate(`/teacher/homework/${h.id}/grade`)}>
                      Grade ({subs.length})
                    </button>
                    <button className={styles.hwBtn} onClick={() => navigate(`/teacher/homework/${h.id}/edit`)}>
                      Edit
                    </button>
                    <button className={`${styles.hwBtn} ${styles.hwBtnDanger}`} onClick={(e) => handleDelete(e, h.id)}>
                      Delete
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
