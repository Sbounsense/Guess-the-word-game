import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { toEmbedUrl } from '../../utils/embedUrl.js'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import styles from './LessonEditor.module.css'

export default function LessonEditor() {
  const { lessonId } = useParams()
  const { getLessons, saveLesson, getDecks } = useData()
  const navigate = useNavigate()

  const lesson = getLessons().find(l => l.id === lessonId)
  if (!lesson) return <div className="page"><p>Lesson not found.</p></div>

  const [title, setTitle] = useState(lesson.title)
  const [content, setContent] = useState(lesson.content)
  const [deckId, setDeckId] = useState(lesson.deckId || '')
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || '')
  const [pdfMode, setPdfMode] = useState('link')
  const [pdfUrl, setPdfUrl] = useState(lesson.pdfUrl || '')
  const [embedPreview, setEmbedPreview] = useState(null)
  const [pdfWarning, setPdfWarning] = useState(false)

  const decks = getDecks()
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setEmbedPreview(toEmbedUrl(videoUrl))
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [videoUrl])

  const handlePdfUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) setPdfWarning(true)
    else setPdfWarning(false)
    const reader = new FileReader()
    reader.onload = (ev) => setPdfUrl(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = (e) => {
    e.preventDefault()
    saveLesson({
      ...lesson,
      title,
      content,
      deckId: deckId || null,
      videoUrl: videoUrl || null,
      pdfUrl: pdfUrl || null,
    })
    navigate(`/teacher/modules/${lesson.moduleId}`)
  }

  return (
    <div className="page">
      <button className={styles.back} onClick={() => navigate(`/teacher/modules/${lesson.moduleId}`)}>← Module</button>
      <h1 className="page-title">Edit Lesson</h1>

      <form onSubmit={handleSave}>
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

        {/* Video section */}
        <Card style={{ marginBottom: 20 }}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>▶</span>
            <div>
              <div className={styles.sectionTitle}>Video Lesson (optional)</div>
              <div className={styles.sectionSub}>Paste a YouTube or Vimeo URL</div>
            </div>
          </div>
          <div className={styles.field} style={{ marginTop: 12 }}>
            <input
              className={styles.input}
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          {embedPreview && (
            <div className={styles.videoPreviewWrap}>
              <div className={styles.videoPreviewLabel}>Preview</div>
              <div className={styles.videoFrame}>
                <iframe src={embedPreview} title="Preview" frameBorder="0" allowFullScreen />
              </div>
            </div>
          )}
          {videoUrl && !embedPreview && (
            <p className={styles.hint}>Could not parse URL. Try a standard YouTube or Vimeo link.</p>
          )}
        </Card>

        {/* PDF section */}
        <Card style={{ marginBottom: 20 }}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>📄</span>
            <div>
              <div className={styles.sectionTitle}>PDF Attachment (optional)</div>
              <div className={styles.sectionSub}>Link to an external PDF or upload a file</div>
            </div>
          </div>
          <div className={styles.pdfToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${pdfMode === 'link' ? styles.toggleActive : ''}`}
              onClick={() => { setPdfMode('link'); setPdfUrl('') }}
            >Link</button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${pdfMode === 'upload' ? styles.toggleActive : ''}`}
              onClick={() => { setPdfMode('upload'); setPdfUrl('') }}
            >Upload</button>
          </div>
          {pdfMode === 'link' ? (
            <div className={styles.field} style={{ marginTop: 12 }}>
              <input
                className={styles.input}
                value={pdfUrl}
                onChange={e => setPdfUrl(e.target.value)}
                placeholder="https://example.com/document.pdf"
              />
            </div>
          ) : (
            <div className={styles.field} style={{ marginTop: 12 }}>
              <input
                type="file"
                accept=".pdf"
                className={styles.fileInput}
                onChange={handlePdfUpload}
              />
              {pdfWarning && (
                <p className={styles.warning}>⚠ File is larger than 2 MB — this may use significant storage space.</p>
              )}
              {pdfUrl && pdfUrl.startsWith('data:') && (
                <p className={styles.hint}>✓ PDF loaded. Will be saved when you click Save.</p>
              )}
            </div>
          )}
        </Card>

        <Button type="submit" variant="primary">Save Lesson</Button>
      </form>
    </div>
  )
}
