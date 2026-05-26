import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import styles from './ResourceHub.module.css'

export default function ResourceHub() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { getSubjects, getDecks, getModules, getLessons } = useData()

  const [query, setQuery] = useState('')

  const subjects = getSubjects()
  const allDecks = getDecks()
  const allModules = getModules()
  const allLessons = getLessons()

  const q = query.trim().toLowerCase()

  // Filter decks by search query
  const filteredDecks = q
    ? allDecks.filter(d => d.title?.toLowerCase().includes(q))
    : allDecks

  // Only lessons from modules assigned to the current user
  const assignedModuleIds = allModules
    .filter(m => m.assignedTo?.includes(currentUser.id))
    .map(m => m.id)

  const assignedLessons = allLessons.filter(l => assignedModuleIds.includes(l.moduleId))

  // Filter lessons by search query
  const filteredLessons = q
    ? assignedLessons.filter(l => l.title?.toLowerCase().includes(q))
    : assignedLessons

  // Lessons don't have subjectId — resolve via their module
  function subjectIdForLesson(lesson) {
    const mod = allModules.find(m => m.id === lesson.moduleId)
    return mod?.subjectId || null
  }

  // Build sections: one per subject + one "Other"
  const sections = subjects.map(subj => {
    const decks = filteredDecks.filter(d => d.subjectId === subj.id)
    const lessons = filteredLessons.filter(l => subjectIdForLesson(l) === subj.id)
    return { id: subj.id, name: subj.name, decks, lessons }
  })

  // Other: decks/lessons with no matching subject
  const subjectIds = new Set(subjects.map(s => s.id))
  const otherDecks = filteredDecks.filter(d => !subjectIds.has(d.subjectId))
  const otherLessons = filteredLessons.filter(l => !subjectIds.has(subjectIdForLesson(l)))

  // Remove empty sections when searching
  const visibleSections = sections.filter(s => s.decks.length > 0 || s.lessons.length > 0)
  const showOther = otherDecks.length > 0 || otherLessons.length > 0

  const noResults = q && visibleSections.length === 0 && !showOther

  // Group lessons by moduleId for display
  function groupByModule(lessons) {
    const groups = {}
    lessons.forEach(l => {
      const key = l.moduleId || '__none__'
      if (!groups[key]) groups[key] = []
      groups[key].push(l)
    })
    return groups
  }

  function renderSection({ id, name, decks, lessons }) {
    const grouped = groupByModule(lessons)
    return (
      <section key={id} className={styles.section}>
        <h2 className={styles.subjectHeading}>{name}</h2>

        {decks.length > 0 && (
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Decks</h3>
            <div className={styles.deckRow}>
              {decks.map(deck => (
                <Card key={deck.id} className={styles.deckCard}>
                  <div className={styles.deckTitle}>{deck.title}</div>
                  <div className={styles.deckMeta}>
                    {(deck.cards?.length ?? 0)} card{(deck.cards?.length ?? 0) !== 1 ? 's' : ''}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/study/${deck.id}`)}
                  >
                    Study →
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {lessons.length > 0 && (
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Lessons</h3>
            <ul className={styles.lessonList}>
              {Object.entries(grouped).map(([moduleId, modLessons]) => {
                const mod = allModules.find(m => m.id === moduleId)
                return (
                  <li key={moduleId} className={styles.moduleGroup}>
                    {mod && (
                      <span className={styles.moduleLabel}>{mod.title}</span>
                    )}
                    {modLessons.map(lesson => (
                      <div key={lesson.id} className={styles.lessonRow}>
                        <span className={styles.lessonTitle}>{lesson.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/modules/${lesson.moduleId}/lessons/${lesson.id}`)}
                        >
                          Open →
                        </Button>
                      </div>
                    ))}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="page">
      <div className={styles.pageHeader}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>Resource Hub</h1>
        <p className={styles.subtitle}>All study materials, organised by subject</p>
      </div>

      <div className={styles.searchWrap}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search decks and lessons…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {noResults ? (
        <div className="empty-state">
          <p>No materials match your search.</p>
        </div>
      ) : (
        <>
          {visibleSections.map(renderSection)}

          {showOther && renderSection({
            id: '__other__',
            name: 'Other',
            decks: otherDecks,
            lessons: otherLessons,
          })}

          {!q && visibleSections.length === 0 && !showOther && (
            <div className="empty-state">
              <p>No study materials available yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
