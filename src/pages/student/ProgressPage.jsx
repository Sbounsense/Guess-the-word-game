import { useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './ProgressPage.module.css'

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export default function ProgressPage() {
  const { currentUser } = useAuth()
  const { getProgress, getUserGamification, getDecks } = useData()

  const [goal, setGoal] = useState(() => {
    const stored = localStorage.getItem('eq_weekly_goal')
    return stored ? parseInt(stored, 10) : 5
  })
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(String(goal))

  const gami = getUserGamification(currentUser.id)
  const allProgress = getProgress().filter(p => p.userId === currentUser.id)
  const decks = getDecks()

  const last7Days = useMemo(() => getLast7Days(), [])

  const thisWeekSessions = useMemo(() => {
    const cutoff = last7Days[0]
    return allProgress.filter(p => p.sessionDate >= cutoff).length
  }, [allProgress, last7Days])

  const sessionsPerDay = useMemo(() => {
    const map = {}
    last7Days.forEach(d => { map[d] = 0 })
    allProgress.forEach(p => {
      if (map[p.sessionDate] !== undefined) map[p.sessionDate]++
    })
    return last7Days.map(d => ({ date: d, count: map[d] }))
  }, [allProgress, last7Days])

  const maxCount = useMemo(() => Math.max(1, ...sessionsPerDay.map(d => d.count)), [sessionsPerDay])

  const deckBreakdown = useMemo(() => {
    const map = {}
    allProgress.forEach(p => {
      if (!p.deckId) return
      map[p.deckId] = (map[p.deckId] || 0) + 1
    })
    return Object.entries(map)
      .map(([deckId, count]) => {
        const deck = decks.find(d => d.id === deckId)
        return { deckId, title: deck ? deck.title : deckId, count }
      })
      .sort((a, b) => b.count - a.count)
  }, [allProgress, decks])

  const goalPercent = Math.min(100, Math.round((thisWeekSessions / (goal || 1)) * 100))

  function handleGoalSave() {
    const val = Math.max(1, parseInt(goalInput, 10) || 1)
    setGoal(val)
    setGoalInput(String(val))
    localStorage.setItem('eq_weekly_goal', String(val))
    setEditingGoal(false)
  }

  return (
    <div className="page">
      <div className={styles.header}>
        <h1 className="page-title">Progress</h1>
        <p className={styles.subtitle}>Your study activity at a glance</p>
      </div>

      {/* Top stats row */}
      <div className={styles.statsGrid}>
        <Card>
          <div className={styles.statVal}>{gami.totalXP ?? 0}</div>
          <div className={styles.statLabel}>Total XP</div>
        </Card>
        <Card>
          <div className={styles.statVal}>🔥 {gami.currentStreak ?? 0}</div>
          <div className={styles.statLabel}>Current Streak</div>
        </Card>
        <Card>
          <div className={styles.statVal}>{gami.totalSessions ?? 0}</div>
          <div className={styles.statLabel}>Total Sessions</div>
        </Card>
        <Card>
          <div className={styles.statVal}>{thisWeekSessions}</div>
          <div className={styles.statLabel}>This Week</div>
        </Card>
      </div>

      {/* Weekly goal */}
      <Card className={styles.goalCard}>
        <div className={styles.goalHeader}>
          <h2 className={styles.cardTitle}>Weekly Goal</h2>
          {!editingGoal ? (
            <button className={styles.editBtn} onClick={() => { setGoalInput(String(goal)); setEditingGoal(true) }}>
              Edit
            </button>
          ) : (
            <div className={styles.goalEdit}>
              <input
                type="number"
                min="1"
                className={styles.goalInput}
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleGoalSave() }}
              />
              <button className={styles.saveBtn} onClick={handleGoalSave}>Save</button>
            </div>
          )}
        </div>
        <div className={styles.goalText}>{thisWeekSessions} / {goal} sessions this week</div>
        <div className={styles.progressBarWrap}>
          <div className={styles.progressBar} style={{ width: `${goalPercent}%` }} />
        </div>
        <div className={styles.goalPercent}>{goalPercent}% of weekly goal</div>
      </Card>

      {/* Last 7 days bar chart */}
      <Card className={styles.chartCard}>
        <h2 className={styles.cardTitle}>Last 7 Days</h2>
        <div className={styles.barChart}>
          {sessionsPerDay.map(({ date, count }) => {
            const barH = count > 0 ? Math.max(2, Math.round((count / maxCount) * 60)) : 2
            const dayLabel = DAY_ABBR[new Date(date + 'T00:00:00').getDay()]
            return (
              <div key={date} className={styles.barItem}>
                {count > 0 && <div className={styles.barCount}>{count}</div>}
                <div className={styles.bar} style={{ height: `${barH}px` }} />
                <div className={styles.barLabel}>{dayLabel}</div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Subject breakdown */}
      <Card>
        <h2 className={styles.cardTitle}>Subject Breakdown</h2>
        {deckBreakdown.length === 0 ? (
          <p className={styles.emptyText}>No study sessions recorded yet.</p>
        ) : (
          <div className={styles.breakdownList}>
            {deckBreakdown.map(({ deckId, title, count }) => (
              <div key={deckId} className={styles.breakdownRow}>
                <span className={styles.breakdownTitle}>{title}</span>
                <span className={styles.breakdownCount}>{count} {count === 1 ? 'session' : 'sessions'}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
