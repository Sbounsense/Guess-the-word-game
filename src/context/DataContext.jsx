import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../services/supabase.js'
import { genId } from '../utils/id.js'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [subjects, setSubjects]       = useState([])
  const [users, setUsers]             = useState([])
  const [decks, setDecks]             = useState([])
  const [modules, setModules]         = useState([])
  const [lessons, setLessons]         = useState([])
  const [homework, setHomework]       = useState([])
  const [submissions, setSubmissions] = useState([])
  const [progress, setProgress]       = useState([])
  const [groups, setGroups]           = useState([])
  const [weeklyTests, setWeeklyTests] = useState([])
  const [weeklyTestResults, setWeeklyTestResults] = useState([])
  const [loading, setLoading]         = useState(true)
  const [saveError, setSaveError]     = useState(null)
  const [saveToast, setSaveToast]     = useState(null)

  // Prevent concurrent loadAll calls (e.g. rapid auth state changes firing
  // multiple times before the first fetch completes).
  const loadingRef = useRef(false)

  const showToast = (msg, isError = false) => {
    if (isError) setSaveError(msg)
    else setSaveToast(msg)
    setTimeout(() => {
      if (isError) setSaveError(null)
      else setSaveToast(null)
    }, 3500)
  }

  const loadAll = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const [s, u, d, m, l, h, sub, prog, g, wt, wtr] = await Promise.all([
        supabase.from('subjects').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('decks').select('*'),
        supabase.from('modules').select('*'),
        supabase.from('lessons').select('*').order('order', { ascending: true }),
        supabase.from('homework').select('*'),
        supabase.from('submissions').select('*'),
        supabase.from('progress').select('*'),
        supabase.from('groups').select('*'),
        supabase.from('weekly_tests').select('*'),
        supabase.from('weekly_test_results').select('*'),
      ])
      if (!s.error)    setSubjects(s.data)
      if (!u.error)    setUsers(u.data)
      if (!d.error)    setDecks(d.data)
      if (!m.error)    setModules(m.data)
      if (!l.error)    setLessons(l.data)
      if (!h.error)    setHomework(h.data)
      if (!sub.error)  setSubmissions(sub.data)
      if (!prog.error) setProgress(prog.data)
      if (!g.error)    setGroups(g.data)
      if (!wt.error)   setWeeklyTests(wt.data)
      if (!wtr.error)  setWeeklyTestResults(wtr.data)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        loadAll()
      } else {
        setSubjects([]); setUsers([]); setDecks([]); setModules([])
        setLessons([]); setHomework([]); setSubmissions([]); setProgress([])
        setGroups([]); setWeeklyTests([]); setWeeklyTestResults([])
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [loadAll])

  // ── Subjects ────────────────────────────────────────────────────────────
  const getSubjects = () => subjects
  const saveSubject = async (subject) => {
    const row = { id: subject.id, name: subject.label || subject.name, label: subject.label, icon: subject.icon, color: subject.color }
    const { error } = await supabase.from('subjects').upsert(row)
    if (error) { showToast('Failed to save subject: ' + error.message, true); return }
    await loadAll()
  }
  const deleteSubject = async (id) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) { showToast('Failed to delete subject: ' + error.message, true); return }
    setSubjects(prev => prev.filter(s => s.id !== id))
  }

  // ── Users (profiles) ────────────────────────────────────────────────────
  const getUsers = () => users
  const saveUser = async (user) => {
    // role is intentionally excluded — it must only be changed server-side (via DB trigger or
    // an admin-only RPC) to prevent client-side privilege escalation.
    const userData = { id: user.id, name: user.name, active: user.active ?? true, avatarColor: user.avatarColor }
    const { error } = await supabase.from('profiles').upsert(userData)
    if (error) { showToast('Failed to save user: ' + error.message, true); return userData }
    await loadAll()
    return userData
  }
  const deactivateUser = async (id) => {
    const { error } = await supabase.from('profiles').update({ active: false }).eq('id', id)
    if (error) { showToast('Failed to deactivate user: ' + error.message, true); return }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: false } : u))
  }

  // ── Groups ───────────────────────────────────────────────────────────────
  const getGroups = () => groups
  const saveGroup = async (group) => {
    const row = {
      id: group.id || genId('grp'),
      name: group.name,
      description: group.description || null,
      created_by: group.created_by || group.createdBy || null,
      student_ids: group.student_ids || group.studentIds || [],
    }
    const { error } = await supabase.from('groups').upsert(row)
    if (error) { showToast('Failed to save group: ' + error.message, true); return null }
    showToast('Group saved ✓')
    await loadAll()
    return row
  }
  const deleteGroup = async (id) => {
    const { error } = await supabase.from('groups').delete().eq('id', id)
    if (error) { showToast('Failed to delete group: ' + error.message, true); return }
    setGroups(prev => prev.filter(g => g.id !== id))
  }
  const getStudentGroups = (studentId) => groups.filter(g => (g.student_ids || []).includes(studentId))
  const resolveAssignedStudents = (hw) => {
    const direct = new Set(hw.assignedTo || [])
    const fromGroups = new Set()
    ;(hw.group_ids || hw.groupIds || []).forEach(gid => {
      const g = groups.find(gr => gr.id === gid)
      if (g) (g.student_ids || []).forEach(sid => fromGroups.add(sid))
    })
    return [...new Set([...direct, ...fromGroups])]
  }
  const isHomeworkAssignedToStudent = (hw, studentId) => {
    if ((hw.assignedTo || []).includes(studentId)) return true
    return (hw.group_ids || hw.groupIds || []).some(gid => {
      const g = groups.find(gr => gr.id === gid)
      return g && (g.student_ids || []).includes(studentId)
    })
  }

  // ── Decks ────────────────────────────────────────────────────────────────
  const getDecks = () => decks
  const getDeck  = (id) => decks.find(d => d.id === id) || null
  const saveDeck = async (deck) => {
    const deckData = { ...deck, id: deck.id || genId('deck'), createdAt: deck.createdAt || new Date().toISOString(), subjectId: deck.subjectId || null }
    const { error } = await supabase.from('decks').upsert(deckData)
    if (error) { showToast('Failed to save deck: ' + error.message, true); return deckData }
    showToast('Deck saved ✓')
    await loadAll()
    return deckData
  }
  const deleteDeck = async (id) => {
    const { error } = await supabase.from('decks').delete().eq('id', id)
    if (error) { showToast('Failed to delete deck: ' + error.message, true); return }
    setDecks(prev => prev.filter(d => d.id !== id))
  }

  // ── Modules ──────────────────────────────────────────────────────────────
  const getModules = () => modules
  const saveModule = async (mod) => {
    const modData = { ...mod, id: mod.id || genId('mod'), lessonIds: mod.lessonIds || [], createdAt: mod.createdAt || new Date().toISOString(), subjectId: mod.subjectId || null }
    const { error } = await supabase.from('modules').upsert(modData)
    if (error) { showToast('Failed to save module: ' + error.message, true); return }
    showToast('Module saved ✓')
    await loadAll()
  }
  const deleteModule = async (id) => {
    const { error } = await supabase.from('modules').delete().eq('id', id)
    if (error) { showToast('Failed to delete module: ' + error.message, true); return }
    setModules(prev => prev.filter(m => m.id !== id))
  }

  // ── Lessons ──────────────────────────────────────────────────────────────
  const getLessons = () => lessons
  const saveLesson = async (lesson) => {
    const existing = lessons.find(l => l.id === lesson.id)
    const lessonData = { ...lesson, id: lesson.id || genId('les') }
    const { error } = await supabase.from('lessons').upsert(lessonData)
    if (error) { showToast('Failed to save lesson: ' + error.message, true); return }

    if (!existing && lesson.moduleId) {
      const mod = modules.find(m => m.id === lesson.moduleId)
      if (mod && !(mod.lessonIds || []).includes(lessonData.id)) {
        const { error: modErr } = await supabase.from('modules').update({
          lessonIds: [...(mod.lessonIds || []), lessonData.id],
        }).eq('id', lesson.moduleId)
        if (modErr) { showToast('Lesson saved but module link failed: ' + modErr.message, true) }
      }
    }

    showToast('Lesson saved ✓')
    await loadAll()
  }
  const deleteLesson = async (id) => {
    const lesson = lessons.find(l => l.id === id)
    const { error } = await supabase.from('lessons').delete().eq('id', id)
    if (error) { showToast('Failed to delete lesson: ' + error.message, true); return }
    if (lesson?.moduleId) {
      const mod = modules.find(m => m.id === lesson.moduleId)
      if (mod) {
        await supabase.from('modules').update({
          lessonIds: (mod.lessonIds || []).filter(lid => lid !== id),
        }).eq('id', lesson.moduleId)
      }
    }
    await loadAll()
  }

  // ── Homework ─────────────────────────────────────────────────────────────
  const getHomework = () => homework
  const saveHomework = async (hw) => {
    const hwData = { ...hw, id: hw.id || genId('hw'), createdAt: hw.createdAt || new Date().toISOString() }
    const { error } = await supabase.from('homework').upsert(hwData)
    if (error) { showToast('Failed to save homework: ' + error.message, true); return }
    showToast('Homework saved ✓')
    await loadAll()
  }
  const deleteHomework = async (id) => {
    const { error } = await supabase.from('homework').delete().eq('id', id)
    if (error) { showToast('Failed to delete homework: ' + error.message, true); return }
    setHomework(prev => prev.filter(h => h.id !== id))
  }

  // ── Progress ─────────────────────────────────────────────────────────────
  const getProgress = () => progress
  const saveProgress = async (entry) => {
    const row = { ...entry, id: entry.id || genId('prog'), sessionDate: entry.sessionDate || new Date().toISOString().slice(0, 10) }
    const { error } = await supabase.from('progress').insert(row)
    if (error) {
      showToast('Failed to save progress: ' + error.message, true)
      return null
    }
    setProgress(prev => [...prev, row])
    return row
  }

  // ── Submissions ──────────────────────────────────────────────────────────
  const getSubmissions = () => submissions
  const saveSubmission = async (sub) => {
    const newSub = { ...sub, id: sub.id || genId('sub'), submittedAt: new Date().toISOString() }
    const { error } = await supabase.from('submissions').insert(newSub)
    if (error) { showToast('Failed to submit: ' + error.message, true); return newSub }
    setSubmissions(prev => [...prev, newSub])
    return newSub
  }
  const gradeSubmission = async (submissionId, grade, feedback) => {
    const { data, error } = await supabase.from('submissions')
      .update({ grade, grade_feedback: feedback, graded_at: new Date().toISOString() })
      .eq('id', submissionId)
      .select()
      .single()
    if (error) { showToast('Failed to save grade: ' + error.message, true); return }
    showToast('Grade saved ✓')
    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, grade, grade_feedback: feedback } : s))
    return data
  }

  // ── Weekly Tests ─────────────────────────────────────────────────────────
  const getWeeklyTests = () => weeklyTests
  const saveWeeklyTest = async (test) => {
    const row = { ...test, id: test.id || genId('wt'), created_at: test.created_at || new Date().toISOString() }
    const { error } = await supabase.from('weekly_tests').upsert(row)
    if (error) { showToast('Failed to save test: ' + error.message, true); return null }
    showToast('Test saved ✓')
    await loadAll()
    return row
  }
  const deleteWeeklyTest = async (id) => {
    const { error } = await supabase.from('weekly_tests').delete().eq('id', id)
    if (error) { showToast('Failed to delete test: ' + error.message, true); return }
    setWeeklyTests(prev => prev.filter(t => t.id !== id))
  }
  const getWeeklyTestResults = () => weeklyTestResults
  const saveWeeklyTestResult = async (result) => {
    const row = { ...result, id: result.id || genId('wtr'), submitted_at: new Date().toISOString() }
    const { error } = await supabase.from('weekly_test_results').insert(row)
    if (error) { showToast('Failed to submit result: ' + error.message, true); return null }
    setWeeklyTestResults(prev => [...prev, row])
    return row
  }

  // ── File Upload (Supabase Storage) ───────────────────────────────────────
  const uploadFile = async (bucket, file, path) => {
    const options = { upsert: true }
    if (file.type) options.contentType = file.type
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, options)
    if (error) { showToast('Upload failed: ' + error.message, true); return null }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return publicUrl
  }

  return (
    <DataContext.Provider value={{
      loading,
      getSubjects, saveSubject, deleteSubject,
      getUsers, saveUser, deactivateUser,
      getGroups, saveGroup, deleteGroup, getStudentGroups, resolveAssignedStudents, isHomeworkAssignedToStudent,
      getDecks, getDeck, saveDeck, deleteDeck,
      getModules, saveModule, deleteModule,
      getLessons, saveLesson, deleteLesson,
      getHomework, saveHomework, deleteHomework,
      getSubmissions, saveSubmission, gradeSubmission,
      getProgress, saveProgress,
      getWeeklyTests, saveWeeklyTest, deleteWeeklyTest,
      getWeeklyTestResults, saveWeeklyTestResult,
      uploadFile,
      loadAll,
      saveError,
      saveToast,
    }}>
      {children}
      {saveToast && <div className="toast">✓ {saveToast}</div>}
      {saveError && <div className="toast" style={{ background: 'var(--error-container)', color: 'var(--error)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>⚠ {saveError}</div>}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
