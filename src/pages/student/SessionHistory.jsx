import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { storage } from '../../services/storage.js'
import Card from '../../components/ui/Card.jsx'
import styles from './SessionHistory.module.css'

const today = new Date().toISOString().slice(0, 10)
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

function groupLabel(date) {
  if (date === today) return 'Today'
  if (date === yesterday) return 'Yesterday'
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays < 7) return 'This Week'
  return 'Earlier'
}

const modeIcon = (mode) => ({ word_guess: '🔤', flashcard: '🃏', quiz: '❓' }[mode] || '📚')
const modeLabel = (mode) => ({ word_guess: 'Word Guess', flashcard: 'Flashcard', quiz: 'Quiz' }[mode] || mode)

export default function SessionHistory() {
  const { currentUser } = useAuth()
  const { getDecks } = useData()
  const navigate = useNavigate()

  const sessions = storage.getProgress()
    .filter(p => p.userId === currentUser.id)
    .sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate))

  const decks = getDecks()
  const getDeckTitle = (id) => decks.find(d => d.id === id)?.title || 'Unknown deck'

  const totalSessions = sessions.length
  const totalXP = sessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0)
  const avgAcc = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + (s.score / s.total) * 100, 0) / sessions.length)
    : 0

  // group by label
  const groups = {}
  for (const s of sessions) {
    const label = groupLabel(s.sessionDate)
    if (!groups[label]) groups[label] = []
    groups[label].push(s)
  }
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier']

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate('/profile')}>← Profile</button>
      <h1 className="page-title">Session History</h1>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <Card>
          <div className={styles.statVal}>{totalSessions}</div>
          <div className={styles.statLabel}>Total Sessions</div>
        </Card>
        <Card>
          <div className={styles.statVal}>{totalXP}</div>
          <div className={styles.statLabel}>XP Earned</div>
        </Card>
        <Card>
          <div className={styles.statVal}>{avgAcc}%</div>
          <div className={styles.statLabel}>Avg Accuracy</div>
        </Card>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state"><p>No study sessions yet. Start studying to see your history!</p></div>
      ) : (
        groupOrder.filter(g => groups[g]).map(label => (
          <section key={label} className={styles.group}>
            <h2 className={styles.groupLabel}>{label}</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Deck</th>
                    <th>Mode</th>
                    <th>Score</th>
                    <th>Accuracy</th>
                    <th>XP</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {groups[label].map((s, i) => (
                    <tr key={i}>
                      <td className={styles.deckCell}>{getDeckTitle(s.deckId)}</td>
                      <td>{modeIcon(s.mode)} {modeLabel(s.mode)}</td>
                      <td>{s.score}/{s.total}</td>
                      <td>{Math.round(s.score / s.total * 100)}%</td>
                      <td className={styles.xp}>+{s.xpEarned}</td>
                      <td className={styles.date}>{s.sessionDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  )
}
