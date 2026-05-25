import { useState } from 'react'
import styles from './WordGuessGame.module.css'
import Button from '../ui/Button.jsx'

const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const CYRILLIC = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')

export default function WordGuessGame({ card, onResult, language = 'en' }) {
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState(null)

  const letters = language === 'ru' ? CYRILLIC : LATIN
  const rows = language === 'ru'
    ? [letters.slice(0, 12), letters.slice(12, 23), letters.slice(23)]
    : [letters.slice(0, 9), letters.slice(9, 18), letters.slice(18)]

  const appendLetter = (l) => setGuess(g => g + l)

  const handleCheck = () => {
    const correct = guess.trim().toLowerCase() === card.term.toLowerCase()
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) {
      setTimeout(() => {
        setGuess('')
        setFeedback(null)
        onResult(true)
      }, 900)
    }
  }

  const handleSkip = () => {
    setGuess('')
    setFeedback(null)
    onResult(false)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.clue}>
        <span className={styles.clueLabel}>Definition</span>
        <p className={styles.clueText}>{card.definition}</p>
      </div>

      <div className={styles.inputRow}>
        <input
          className={`${styles.input} ${feedback ? styles[feedback] : ''}`}
          value={guess}
          onChange={e => { setGuess(e.target.value); setFeedback(null) }}
          placeholder="Type your answer…"
          onKeyDown={e => e.key === 'Enter' && handleCheck()}
          autoFocus
        />
        <Button variant="green" onClick={handleCheck} disabled={!guess.trim()}>CHECK</Button>
      </div>

      {feedback === 'correct' && <p className={styles.feedCorrect}>✓ Correct!</p>}
      {feedback === 'wrong' && <p className={styles.feedWrong}>✗ Try again or skip</p>}

      <div className={styles.letterGrid}>
        {rows.map((row, ri) => (
          <div key={ri} className={styles.row}>
            {row.map(l => (
              <button key={l} className={styles.tile} onClick={() => appendLetter(l)}>{l}</button>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.skipBtn} onClick={handleSkip}>Skip →</button>
        {guess && <button className={styles.clearBtn} onClick={() => { setGuess(''); setFeedback(null) }}>Clear</button>}
      </div>
    </div>
  )
}
