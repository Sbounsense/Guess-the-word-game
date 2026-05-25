import { useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import { genId } from '../../utils/id.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './SubjectManager.module.css'

const PRESET_COLORS = ['#4dabf7','#69db7c','#ffd43b','#ff7a7a','#cc5de8','#ff8c42','#38d9a9']

export default function SubjectManager() {
  const { getSubjects, saveSubject, deleteSubject } = useData()
  const [label, setLabel] = useState('')
  const [icon, setIcon] = useState('📚')
  const [color, setColor] = useState('#4dabf7')

  const subjects = getSubjects()

  const handleAdd = (e) => {
    e.preventDefault()
    if (!label.trim()) return
    saveSubject({ id: genId('subj'), label: label.trim(), icon, color })
    setLabel('')
    setIcon('📚')
  }

  return (
    <div className="page">
      <h1 className="page-title">Subjects</h1>

      <Card style={{ marginBottom: 24 }}>
        <h2 className="section-title">Add Subject</h2>
        <form className={styles.form} onSubmit={handleAdd}>
          <input className={styles.input} value={label} onChange={e => setLabel(e.target.value)} placeholder="Subject name" required />
          <input className={styles.inputSm} value={icon} onChange={e => setIcon(e.target.value)} placeholder="Icon" maxLength={2} />
          <div className={styles.colorRow}>
            {PRESET_COLORS.map(c => (
              <button key={c} type="button" className={`${styles.colorDot} ${color === c ? styles.colorActive : ''}`}
                style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
          <Button type="submit" variant="primary" size="sm">Add</Button>
        </form>
      </Card>

      <div className="grid-3">
        {subjects.map(s => (
          <Card key={s.id}>
            <div className={styles.subject}>
              <span className={styles.icon}>{s.icon}</span>
              <div className={styles.info}>
                <div className={styles.name}>{s.label}</div>
                <div className={styles.colorDotSmall} style={{ background: s.color }} />
              </div>
              <button className={styles.del} onClick={() => {
                if (window.confirm(`Delete subject "${s.label}"?`)) deleteSubject(s.id)
              }}>✕</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
