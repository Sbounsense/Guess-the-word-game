import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useGamification } from '../../context/GamificationContext.jsx'
import { shuffle } from '../../utils/shuffle.js'
import { genId } from '../../utils/id.js'
import { BADGE_DEFS } from '../../data/badges.js'
import MatchingGame from '../../components/game/MatchingGame.jsx'
import WordGuessGame from '../../components/game/WordGuessGame.jsx'
import FlashcardFlip from '../../components/game/FlashcardFlip.jsx'
import MultipleChoice from '../../components/game/MultipleChoice.jsx'
import Button from '../../components/ui/Button.jsx'
import styles from './StudySession.module.css'

const MODES = [
  { id: 'word_guess',  label: 'Word Guess',   icon: '🔡', desc: 'Type the answer using letter tiles' },
  { id: 'flashcard',  label: 'Flashcard',     icon: '🃏', desc: 'Flip cards and self-rate your knowledge' },
  { id: 'quiz',       label: 'Quiz',          icon: '✅', desc: 'Pick the right answer from 4 choices' },
  { id: 'timed',      label: 'Timed',         icon: '⏱️', desc: 'Race the clock — 10 seconds per card' },
  { id: 'matching',   label: 'Matching',      icon: '🔗', desc: 'Connect each term to its definition' },
]

export default function StudySession() {
  const { deckId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getDeck, saveProgress } = useData()
  const { currentUser } = useAuth()
  const { recordSession, toast, newBadges, dismissBadges } = useGamification()

  const deck = getDeck(deckId)
  const [mode, setMode] = useState(null)
  const [cards, setCards] = useState([])
  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)
  const [sessionResult, setSessionResult] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const timerRef = useRef(null)
  const [wrongCards, setWrongCards] = useState([])
  const [reviewingMistakes, setReviewingMistakes] = useState(false)

  const startSession = (selectedMode) => {
    const deckCards = deck.cards || []
    if (deckCards.length === 0) return
    setMode(selectedMode)
    setCards(shuffle(deckCards))
    setIdx(0)
    setCorrect(0)
    setDone(false)
    setWrongCards([])
    setReviewingMistakes(false)
    if (selectedMode === 'timed') {
      setTimeLeft(10)
    }
  }

  const startMistakesReview = () => {
    setCards(wrongCards)
    setWrongCards([])
    setIdx(0)
    setCorrect(0)
    setDone(false)
    setSessionResult(null)
    setReviewingMistakes(true)
    // keep current mode
  }

  useEffect(() => {
    if (mode !== 'timed' || done || timeLeft === null) return
    if (timeLeft <= 0) {
      handleResult(false)
      return
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [timeLeft, mode, done])

  const handleResult = async (wasCorrect) => {
    if (!wasCorrect) {
      setWrongCards(prev => [...prev, cards[idx]])
    }
    const newCorrect = correct + (wasCorrect ? 1 : 0)
    if (idx + 1 >= cards.length) {
      const total = cards.length
      const isPerfect = newCorrect === total
      const result = await recordSession(currentUser.id, { correct: newCorrect, total, isPerfect })
      await saveProgress({
        id: genId('prog'),
        userId: currentUser.id,
        deckId,
        sessionDate: new Date().toISOString().slice(0, 10),
        score: newCorrect,
        total,
        xpEarned: result.xp,
        mode,
      })
      setSessionResult({ correct: newCorrect, total, xp: result.xp })
      setDone(true)
    } else {
      setCorrect(newCorrect)
      if (mode === 'timed') setTimeLeft(10)
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
            🏅 Badge Earned! {newBadges.map(id => BADGE_DEFS.find(b => b.id === id)?.name || id).join(', ')}
            <span className={styles.dismiss}>Tap to dismiss</span>
          </div>
        </div>
      )}

      {!mode && !done && (
        <div className={styles.modeSelect}>
          <h1 className={styles.deckTitle}>{deck.title}</h1>
          <p className={styles.cardCount}>{(deck.cards || []).length} cards</p>
          {(deck.cards || []).length === 0 ? (
            <p style={{ color: 'var(--outline)', marginBottom: 24 }}>This deck has no cards yet. Come back when the teacher adds some!</p>
          ) : (
            <>
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
            </>
          )}
          <button className={styles.back} onClick={() => navigate(returnTo)}>← Back</button>
        </div>
      )}

      {mode && !done && mode !== 'matching' && (
        <div className={styles.session}>
          {reviewingMistakes && (
            <div className={styles.mistakeBanner}>🔁 Reviewing mistakes only</div>
          )}
          <div className={styles.progress}>
            <span>{deck.title}</span>
            <span>{idx + 1} / {cards.length}</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${((idx) / cards.length) * 100}%` }} />
          </div>

          {mode === 'timed' && timeLeft !== null && (
            <div className={styles.timerRow}>
              <div className={styles.timerBar}>
                <div className={styles.timerFill} style={{ width: `${(timeLeft / 10) * 100}%`, background: timeLeft <= 3 ? 'var(--error)' : 'var(--tertiary-dim)' }} />
              </div>
              <span className={styles.timerNum} style={{ color: timeLeft <= 3 ? 'var(--error)' : 'var(--outline)' }}>{timeLeft}s</span>
            </div>
          )}

          {mode === 'word_guess' && (
            <WordGuessGame card={cards[idx]} onResult={handleResult} language={deck.language || 'en'} />
          )}
          {mode === 'flashcard' && (
            <FlashcardFlip card={cards[idx]} onResult={handleResult} />
          )}
          {mode === 'quiz' && (
            <MultipleChoice card={cards[idx]} allCards={deck.cards} onResult={handleResult} />
          )}
          {mode === 'timed' && (
            <MultipleChoice card={cards[idx]} allCards={deck.cards} onResult={handleResult} />
          )}
        </div>
      )}

      {mode === 'matching' && !done && (
        <div className={styles.session}>
          <MatchingGame
            cards={cards}
            onComplete={async (correct, total) => {
              const result = await recordSession(currentUser.id, { correct, total, isPerfect: correct === total })
              await saveProgress({ id: genId('prog'), userId: currentUser.id, deckId, sessionDate: new Date().toISOString().slice(0, 10), score: correct, total, xpEarned: result.xp, mode })
              setSessionResult({ correct, total, xp: result.xp })
              setDone(true)
            }}
          />
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
              {sessionResult.total > 0 ? Math.round((sessionResult.correct / sessionResult.total) * 100) : 0}% accuracy
            </p>
            <div className={styles.resultActions}>
              <Button variant="green" onClick={() => startSession(mode)}>Play Again</Button>
              <Button variant="secondary" onClick={() => navigate(returnTo)}>Back</Button>
            </div>
            {wrongCards.length > 0 && (
              <Button variant="secondary" onClick={startMistakesReview}>
                🔁 Review {wrongCards.length} Mistake{wrongCards.length > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
