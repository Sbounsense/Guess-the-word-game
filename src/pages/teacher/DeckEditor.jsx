import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { genId } from '../../utils/id.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './DeckEditor.module.css'

export default function DeckEditor() {
  const { deckId } = useParams()
  const { currentUser } = useAuth()
  const { getDeck, saveDeck, deleteDeck, getSubjects } = useData()
  const navigate = useNavigate()

  const isNew = !deckId || deckId === 'new'
  const existing = isNew ? null : getDeck(deckId)

  const [title, setTitle] = useState(existing?.title || '')
  const [subjectId, setSubjectId] = useState(existing?.subjectId || 'custom')
  const [language, setLanguage] = useState(existing?.language || 'en')
  const [cards, setCards] = useState(existing?.cards || [{ id: genId('c'), term: '', definition: '' }])

  const subjects = getSubjects()

  const addCard = () => setCards(cs => [...cs, { id: genId('c'), term: '', definition: '' }])
  const updateCard = (idx, field, value) => setCards(cs => cs.map((c, i) => i === idx ? { ...c, [field]: value } : c))
  const removeCard = (idx) => setCards(cs => cs.filter((_, i) => i !== idx))

  const handleSave = (e) => {
    e.preventDefault()
    const deck = {
      id: existing?.id || genId('deck'),
      title,
      subjectId,
      language,
      createdBy: currentUser.id,
      cards: cards.filter(c => c.term.trim() && c.definition.trim()),
    }
    saveDeck(deck)
    navigate('/teacher')
  }

  const handleDelete = () => {
    if (window.confirm('Delete this deck?')) {
      deleteDeck(deckId)
      navigate('/teacher')
    }
  }

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate('/teacher')}>← Back</button>
      <h1 className="page-title">{isNew ? 'New Deck' : 'Edit Deck'}</h1>

      <form onSubmit={handleSave}>
        <Card style={{ marginBottom: 20 }}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Deck title</label>
              <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Animals in English" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Subject</label>
              <select className={styles.select} value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Language</label>
              <select className={styles.select} value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="en">English (Latin alphabet)</option>
                <option value="ru">Russian (Cyrillic alphabet)</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex-between" style={{ marginBottom: 12 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Cards ({cards.length})</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addCard}>+ Add Card</Button>
        </div>

        <div className={styles.cardList}>
          {cards.map((card, i) => (
            <Card key={card.id} className={styles.cardRow}>
              <div className={styles.cardNum}>{i + 1}</div>
              <div className={styles.cardFields}>
                <input
                  className={styles.cardInput}
                  placeholder="Term"
                  value={card.term}
                  onChange={e => updateCard(i, 'term', e.target.value)}
                />
                <input
                  className={styles.cardInput}
                  placeholder="Definition"
                  value={card.definition}
                  onChange={e => updateCard(i, 'definition', e.target.value)}
                />
              </div>
              <button type="button" className={styles.removeBtn} onClick={() => removeCard(i)}>✕</button>
            </Card>
          ))}
        </div>

        <div className={styles.formActions}>
          <Button type="submit" variant="primary">Save Deck</Button>
          {!isNew && <Button type="button" variant="danger" onClick={handleDelete}>Delete</Button>}
        </div>
      </form>
    </div>
  )
}
