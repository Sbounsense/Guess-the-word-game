import { useState, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useGamification } from '../../context/GamificationContext.jsx'
import { storage } from '../../services/storage.js'
import { shuffle } from '../../utils/shuffle.js'
import WordGuessGame from '../../components/game/WordGuessGame.jsx'
import FlashcardFlip from '../../components/game/FlashcardFlip.jsx'
import MultipleChoice from '../../components/game/MultipleChoice.jsx'
import Button from '../../components/ui/Button.jsx'
import styles from './StudySession.module.css'

const MODES = [
  { id: 'word_guess',  label: 'Word Guess',   icon: '🔡', desc: 'Type the answer using letter tiles' },
  { id: 'flashcard',  label: 'Flashcard',     icon: '🃏', desc: 'Flip cards and self-rate your knowledge' },
  { id: 'quiz',       label: 'Quiz',          icon: '✅', desc: 'Pick the right answer from 4 choices' },
]

export default function StudySession() {
  const { deckId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getDeck } = useData()
  const { currentUser } = useAuth()
  const { recordSession, toast, newBadges, dismissBadges } = useGamification()

  const deck = getDeck(deckId)
  const [mode, setMode] = useState(null)
  const [cards, setCards] = useState([])
  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)
  const [sessionResult, setSessionResult] = useState(null)

  const startSession = (selectedMode) => {
    setMode(selectedMode)
    setCards(shuffle(deck.cards))
    setIdx(0)
    setCorrect(0)
    setDone(false)
  }

  const handleResult = (wasCorrect) => {
    const newCorrect = correct + (wasCorrect ? 1 : 0)
    if (idx + 1 >= cards.length) {
      const total = cards.length
      const isPerfect = newCorrect === total
      const result = recordSession(currentUser.id, { correct: newCorrect, total, isPerfect })
      // save to progress
      const progress = storage.getProgress()
      progress.push({
        userId: currentUser.id,
        deckId,
        sessionDate: new Date().toISOString(),
        score: newCorrect,
        total,
        xpEarned: result.xp,
        mode,
      })
      storage.setProgress(progress)
      setSessionResult({ correct: newCorrect, total, xp: result.xp })
      setDone(true)
    } else {
      setCorrect(newCorrect)
      setIdx(i => i + 1)
    }
  }

  if (!deck) return <div className={styles.page}><p>Deck not found.</p></div>

  const returnTo = searchParams.get('from') || -1

  return (
    <div className={styles.page}>
      {toast && (
        <div className={styles.toast}>+{toast.xp} XP</div>
      )}

      {newBadges.length > 0 && (
        <div className={styles.badgeToast} onClick={dismissBadges}>
          <div className={styles.badgeInner}>
            🏅 Badge Earned! {newBadges.join(', ')}
            <span className={styles.dismiss}>Tap to dismiss</span>
          </div>
        </div>
      )}

      {!mode && !done && (
        <div className={styles.modeSelect}>
          <h1 className={styles.deckTitle}>{deck.title}</h1>
          <p className={styles.cardCount}>{deck.cards.length} cards</p>
          <h2 className={styles.pickLabel}>Choose a study mode</h2>
          <div className={styles.modeGrid}>
            {MODES.map(m => (
              <button key={m.id} className={styles.modeCard} onClick={() => startSession(m.id)}>
                <span className={styles.modeIcon}>{m.icon}</span>
                <span className={styles.modeName}>{m.label}</span>
                <span className={styles.modeDesc}>{m.desc}</span>
              </button>
            ))}
          </div>
          <button className={styles.back} onClick={() => navigate(returnTo)}>← Back</button>
        </div>
      )}

      {mode && !done && (
        <div className={styles.session}>
          <div className={styles.progress}>
            <span>{deck.title}</span>
            <span>{idx + 1} / {cards.length}</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${((idx) / cards.length) * 100}%` }} />
          </div>

          {mode === 'word_guess' && (
            <WordGuessGame card={cards[idx]} onResult={handleResult} language={deck.language || 'en'} />
          )}
          {mode === 'flashcard' && (
            <FlashcardFlip card={cards[idx]} onResult={handleResult} />
          )}
          {mode === 'quiz' && (
            <MultipleChoice card={cards[idx]} allCards={deck.cards} onResult={handleResult} />
          )}
        </div>
      )}

      {done && sessionResult && (
        <div className={styles.results}>
          <div className={styles.resultsCard}>
            <div className={styles.resultIcon}>{sessionResult.correct === sessionResult.total ? '🏆' : '📊'}</div>
            <h2>Session Complete!</h2>
            <div className={styles.score}>
              {sessionResult.correct} / {sessionResult.total}
            </div>
            <p className={styles.xpEarned}>+{sessionResult.xp} XP earned</p>
            <p className={styles.accuracy}>
              {Math.round((sessionResult.correct / sessionResult.total) * 100)}% accuracy
            </p>
            <div className={styles.resultActions}>
              <Button variant="green" onClick={() => startSession(mode)}>Play Again</Button>
              <Button variant="secondary" onClick={() => navigate(returnTo)}>Back</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
