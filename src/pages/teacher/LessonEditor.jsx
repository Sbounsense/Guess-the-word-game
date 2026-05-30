import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { genId } from '../../utils/id.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './LessonEditor.module.css'

export default function LessonEditor() {
  const { lessonId } = useParams()
  const { getLessons, saveLesson, getDecks, uploadFile } = useData()
  const navigate = useNavigate()

  const lesson = getLessons().find(l => l.id === lessonId)

  // Hooks must be called unconditionally — the not-found guard is placed after all hooks
  const [title, setTitle]       = useState(lesson?.title || '')
  const [content, setContent]   = useState(lesson?.content || '')
  const [deckId, setDeckId]     = useState(lesson?.deckId || '')
  const [youtubeUrl, setYoutubeUrl] = useState(lesson?.youtube_url || '')
  const [pdfFile, setPdfFile]   = useState(null)
  const [pdfAttachments, setPdfAttachments] = useState(lesson?.pdf_attachments || [])
  const [uploading, setUploading] = useState(false)

  if (!lesson) return <div className="page"><p>Lesson not found.</p></div>

  const decks = getDecks()

  const handleSave = async (e) => {
    e.preventDefault()
    setUploading(true)

    let updatedPdfs = [...pdfAttachments]
    if (pdfFile) {
      const safeName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `lesson-${genId('pdf')}-${safeName}`
      const url = await uploadFile('lesson-materials', pdfFile, path)
      if (url) updatedPdfs = [...updatedPdfs, { name: pdfFile.name, url }]
    }

    await saveLesson({
      ...lesson,
      title,
      content,
      deckId: deckId || null,
      youtube_url: youtubeUrl || null,
      pdf_attachments: updatedPdfs,
    })
    setUploading(false)
    navigate(`/teacher/modules/${lesson.moduleId}`)
  }

  const removePdf = (url) => setPdfAttachments(prev => prev.filter(p => p.url !== url))

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate(`/teacher/modules/${lesson.moduleId}`)}>← Module</button>
      <h1 className="page-title">Edit Lesson</h1>

      <form onSubmit={handleSave}>
        {/* Basic content */}
        <Card style={{ marginBottom: 20 }}>
          <div className={styles.field}>
            <label className={styles.label}>Lesson title</label>
            <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className={styles.field} style={{ marginTop: 16 }}>
            <label className={styles.label}>Content</label>
            <textarea
              className={styles.textarea}
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={10}
              placeholder="Write lesson content. Use **bold** for headings and - for bullet points."
            />
            <span className={styles.hint}>Supports: **Bold** and - bullet points</span>
          </div>

          <div className={styles.field} style={{ marginTop: 16 }}>
            <label className={styles.label}>Attach a practice deck (optional)</label>
            <select className={styles.select} value={deckId} onChange={e => setDeckId(e.target.value)}>
              <option value="">— No deck —</option>
              {decks.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
        </Card>

        {/* YouTube video */}
        <Card style={{ marginBottom: 20 }}>
          <h3 className={styles.sectionTitle}>YouTube Video (optional)</h3>
          <p style={{ color: 'var(--on-surface-2)', fontSize: '0.85rem', marginBottom: 10 }}>
            Paste a YouTube link — it will be embedded in the lesson for students.
          </p>
          <input
            className={styles.input}
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {youtubeUrl && <YoutubePreview url={youtubeUrl} />}
        </Card>

        {/* PDF attachments */}
        <Card style={{ marginBottom: 20 }}>
          <h3 className={styles.sectionTitle}>PDF Materials (optional)</h3>
          <p style={{ color: 'var(--on-surface-2)', fontSize: '0.85rem', marginBottom: 10 }}>
            Upload PDFs that students can download from this lesson.
          </p>

          {pdfAttachments.length > 0 && (
            <div className={styles.pdfList}>
              {pdfAttachments.map(p => (
                <div key={p.url} className={styles.pdfRow}>
                  <span>📄</span>
                  <a href={p.url} target="_blank" rel="noreferrer" className={styles.pdfLink}>{p.name}</a>
                  <button type="button" className={styles.removeBtn} onClick={() => removePdf(p.url)}>Remove</button>
                </div>
              ))}
            </div>
          )}

          <input
            type="file"
            accept="application/pdf"
            className={styles.fileInput}
            onChange={e => setPdfFile(e.target.files[0] || null)}
          />
          {pdfFile && <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-2)', marginTop: 6, display: 'block' }}>Selected: {pdfFile.name}</span>}
        </Card>

        <Button type="submit" variant="primary" disabled={uploading}>
          {uploading ? 'Saving…' : 'Save Lesson'}
        </Button>
      </form>
    </div>
  )
}

function YoutubePreview({ url }) {
  const videoId = extractYoutubeId(url)
  if (!videoId) return <p style={{ color: 'var(--on-surface-2)', fontSize: '0.82rem', marginTop: 8 }}>Invalid YouTube URL</p>
  return (
    <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9', maxWidth: 480 }}>
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube preview"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ display: 'block' }}
      />
    </div>
  )
}

// Strictly validate the extracted video ID to prevent iframe injection.
// Matches only the canonical 11-character YouTube video ID format.
const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/

function extractYoutubeId(url) {
  try {
    const u = new URL(url)
    let id = null
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1).split('/')[0]
    else if (u.hostname.includes('youtube.com')) id = u.searchParams.get('v')
    return id && YOUTUBE_ID_RE.test(id) ? id : null
  } catch { /* invalid URL */ }
  return null
}
