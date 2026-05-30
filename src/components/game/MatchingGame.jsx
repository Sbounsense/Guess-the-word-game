import { useState, useEffect } from 'react'
import styles from './MatchingGame.module.css'

export default function MatchingGame({ cards, onComplete }) {
  // Take up to 6 cards for the matching set
  const set = cards.slice(0, 6)

  const [terms, setTerms] = useState(() => shuffle([...set].map((c, i) => ({ id: i, text: c.term, cardIdx: i }))))
  const [defs, setDefs] = useState(() => shuffle([...set].map((c, i) => ({ id: i, text: c.definition, cardIdx: i }))))
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [selectedDef, setSelectedDef] = useState(null)
  const [matched, setMatched] = useState(new Set()) // set of cardIdx
  const [wrong, setWrong] = useState(null) // { term, def } briefly shown red

  function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  useEffect(() => {
    if (matched.size === set.length) {
      setTimeout(() => onComplete(matched.size, set.length), 600)
    }
  }, [matched])

  const handleTerm = (item) => {
    if (matched.has(item.cardIdx)) return
    setSelectedTerm(item)
    if (selectedDef) checkMatch(item, selectedDef)
  }

  const handleDef = (item) => {
    if (matched.has(item.cardIdx)) return
    setSelectedDef(item)
    if (selectedTerm) checkMatch(selectedTerm, item)
  }

  const checkMatch = (term, def) => {
    if (term.cardIdx === def.cardIdx) {
      setMatched(m => new Set([...m, term.cardIdx]))
      setSelectedTerm(null)
      setSelectedDef(null)
    } else {
      setWrong({ term: term.id, def: def.id })
      setTimeout(() => {
        setWrong(null)
        setSelectedTerm(null)
        setSelectedDef(null)
      }, 600)
    }
  }

  const getTermState = (item) => {
    if (matched.has(item.cardIdx)) return 'matched'
    if (wrong?.term === item.id) return 'wrong'
    if (selectedTerm?.id === item.id) return 'selected'
    return 'idle'
  }

  const getDefState = (item) => {
    if (matched.has(item.cardIdx)) return 'matched'
    if (wrong?.def === item.id) return 'wrong'
    if (selectedDef?.id === item.id) return 'selected'
    return 'idle'
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.progress}>{matched.size} / {set.length} matched</div>
      <div className={styles.grid}>
        <div className={styles.col}>
          {terms.map(item => (
            <button
              key={item.id}
              className={`${styles.tile} ${styles[getTermState(item)]}`}
              onClick={() => handleTerm(item)}
              disabled={matched.has(item.cardIdx)}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className={styles.col}>
          {defs.map(item => (
            <button
              key={item.id}
              className={`${styles.tile} ${styles[getDefState(item)]}`}
              onClick={() => handleDef(item)}
              disabled={matched.has(item.cardIdx)}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
