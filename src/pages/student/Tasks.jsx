import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import styles from './Tasks.module.css'

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }
const PRIORITY_LABELS = { high: '🔴 High', medium: '🟡 Medium', low: '🔵 Low' }

const today = new Date().toISOString().slice(0, 10)

function isOverdue(task) {
  return task.dueDate && task.dueDate < today && !task.done
}

function sortActiveTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const aOver = isOverdue(a)
    const bOver = isOverdue(b)
    if (aOver && !bOver) return -1
    if (!aOver && bOver) return 1
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    return 0
  })
}

export default function Tasks() {
  const { currentUser } = useAuth()
  const { getTasks, saveTask, deleteTask, getHomework } = useData()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [showDone, setShowDone] = useState(false)

  const myTasks = getTasks(currentUser.id)
  const activeTasks = useMemo(() => sortActiveTasks(myTasks.filter(t => !t.done)), [myTasks])
  const doneTasks = useMemo(() => myTasks.filter(t => t.done).reverse(), [myTasks])

  const assignedHomework = getHomework().filter(h => h.assignedTo?.includes(currentUser.id))

  async function handleAddTask(e) {
    e.preventDefault()
    if (!title.trim()) return
    await saveTask({
      userId: currentUser.id,
      title: title.trim(),
      priority,
      dueDate: dueDate || null,
      done: false,
    })
    setTitle('')
    setPriority('medium')
    setDueDate('')
  }

  async function handleToggleDone(task) {
    await saveTask({ ...task, done: !task.done })
  }

  async function handleDelete(id) {
    await deleteTask(id)
  }

  return (
    <div className="page">
      <div className={styles.header}>
        <h1 className="page-title">Tasks</h1>
        <p className={styles.subtitle}>Manage your homework and personal tasks</p>
      </div>

      {/* Quick-add form */}
      <Card className={styles.addCard}>
        <form className={styles.addForm} onSubmit={handleAddTask}>
          <input
            type="text"
            className={styles.titleInput}
            placeholder="Add a new task..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <select
            className={styles.prioritySelect}
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🔵 Low</option>
          </select>
          <input
            type="date"
            className={styles.dateInput}
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
          <Button type="submit" variant="primary">Add Task</Button>
        </form>
      </Card>

      {/* Teacher homework section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Assigned by Teacher</h2>
        {assignedHomework.length === 0 ? (
          <Card>
            <p className={styles.emptyText}>No homework assigned yet.</p>
          </Card>
        ) : (
          <Card>
            <div className={styles.hwList}>
              {assignedHomework.map(hw => {
                const over = hw.dueDate && hw.dueDate < today
                return (
                  <div key={hw.id} className={styles.hwRow}>
                    <span className={styles.hwTitle}>{hw.title}</span>
                    <div className={styles.hwRight}>
                      {hw.dueDate && (
                        <span className={over ? styles.dueBadgeOver : styles.dueBadge}>
                          {over ? 'Overdue ' : 'Due '}{hw.dueDate}
                        </span>
                      )}
                      <button
                        className={styles.linkBtn}
                        onClick={() => navigate(`/homework/${hw.id}`)}
                        title="Open homework"
                      >
                        →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </section>

      {/* Personal tasks section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>My Tasks</h2>

        {/* Active tasks */}
        {activeTasks.length === 0 && doneTasks.length === 0 ? (
          <Card>
            <p className={styles.emptyText}>No personal tasks yet. Add one above!</p>
          </Card>
        ) : (
          <Card>
            {activeTasks.length === 0 ? (
              <p className={styles.emptyText}>All tasks completed!</p>
            ) : (
              <div className={styles.taskList}>
                {activeTasks.map(task => {
                  const over = isOverdue(task)
                  return (
                    <div key={task.id} className={styles.taskRow}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={false}
                        onChange={() => handleToggleDone(task)}
                      />
                      <div
                        className={styles.priorityDot}
                        style={{ background: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium }}
                        title={PRIORITY_LABELS[task.priority] || task.priority}
                      />
                      <span className={styles.taskTitle}>{task.title}</span>
                      {task.dueDate && (
                        <span className={over ? styles.dueDateOver : styles.dueDate}>
                          {over ? 'Overdue ' : ''}{task.dueDate}
                        </span>
                      )}
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(task.id)}
                        title="Delete task"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Done tasks collapsible */}
            {doneTasks.length > 0 && (
              <div className={styles.doneSection}>
                <button
                  className={styles.toggleDoneBtn}
                  onClick={() => setShowDone(s => !s)}
                >
                  {showDone ? '▲' : '▼'} Done ({doneTasks.length})
                </button>
                {showDone && (
                  <div className={styles.taskList}>
                    {doneTasks.map(task => (
                      <div key={task.id} className={`${styles.taskRow} ${styles.doneRow}`}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={true}
                          onChange={() => handleToggleDone(task)}
                          title="Mark as active"
                        />
                        <div
                          className={styles.priorityDot}
                          style={{ background: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium, opacity: 0.4 }}
                        />
                        <span className={styles.taskTitleDone}>{task.title}</span>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(task.id)}
                          title="Delete task"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </section>
    </div>
  )
}
