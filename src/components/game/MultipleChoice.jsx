import { useState, useMemo } from 'react'
import { shuffle } from '../../utils/shuffle.js'
import styles from './MultipleChoice.module.css'

export default function MultipleChoice({ card, allCards, onResult }) {
  const [selected, setSelected] = useState(null)

  const options = useMemo(() => {
    const distractors = allCards
      .filter(c => c.id !== card.id)
      .map(c => c.term)
    const shuffled = shuffle(distractors).slice(0, 3)
    return shuffle([card.term, ...shuffled])
  }, [card, allCards])

  const handleSelect = (opt) => {
    if (selected) return
    setSelected(opt)
    const correct = opt === card.term
    setTimeout(() => {
      setSelected(null)
      onResult(correct)
    }, 1000)
  }

  const getState = (opt) => {
    if (!selected) return ''
    if (opt === card.term) return styles.correct
    if (opt === selected) return styles.wrong
    return ''
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.question}>
        <span className={styles.label}>What is the term for:</span>
        <p className={styles.definition}>{card.definition}</p>
      </div>

      <div className={styles.options}>
        {options.map(opt => (
          <button
            key={opt}
            className={`${styles.option} ${getState(opt)}`}
            onClick={() => handleSelect(opt)}
            disabled={!!selected}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
