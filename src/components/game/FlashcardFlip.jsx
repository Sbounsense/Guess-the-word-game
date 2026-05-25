import { useState } from 'react'
import styles from './FlashcardFlip.module.css'

export default function FlashcardFlip({ card, onResult }) {
  const [flipped, setFlipped] = useState(false)

  const handleKnow = () => { setFlipped(false); onResult(true) }
  const handleLearn = () => { setFlipped(false); onResult(false) }

  return (
    <div className={styles.wrap}>
      <p className={styles.hint}>Click the card to flip it</p>

      <div className={`${styles.scene}`} onClick={() => setFlipped(f => !f)}>
        <div className={`${styles.card} ${flipped ? styles.flipped : ''}`}>
          <div className={styles.front}>
            <span className={styles.label}>Term</span>
            <p className={styles.text}>{card.term}</p>
          </div>
          <div className={styles.back}>
            <span className={styles.label}>Definition</span>
            <p className={styles.text}>{card.definition}</p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className={styles.actions}>
          <button className={styles.btnLearn} onClick={handleLearn}>Still learning</button>
          <button className={styles.btnKnow} onClick={handleKnow}>Got it! ✓</button>
        </div>
      )}
    </div>
  )
}
