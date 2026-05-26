import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase.js'
import { useAuth } from './AuthContext.jsx'
import { genId } from '../utils/id.js'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { currentUser, loading: authLoading } = useAuth()

  const [subjects,    setSubjects]    = useState([])
  const [users,       setUsers]       = useState([])
  const [decks,       setDecks]       = useState([])
  const [modules,     setModules]     = useState([])
  const [lessons,     setLessons]     = useState([])
  const [homework,    setHomework]    = useState([])
  const [submissions, setSubmissions] = useState([])
  const [progress,    setProgress]    = useState([])
  const [gamification,setGamification]= useState({})
  const [completions, setCompletions] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  const clearAll = () => {
    setSubjects([]); setUsers([]); setDecks([]); setModules([])
    setLessons([]); setHomework([]); setSubmissions([]); setProgress([])
    setGamification({}); setCompletions([])
  }

  const loadAll = useCallback(async () => {
    setDataLoading(true)
    const [
      { data: s }, { data: u }, { data: d }, { data: m },
      { data: l }, { data: h }, { data: sb }, { data: p },
      { data: g }, { data: c },
    ] = await Promise.all([
      supabase.from('subjects').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('decks').select('*'),
      supabase.from('modules').select('*'),
      supabase.from('lessons').select('*'),
      supabase.from('homework').select('*'),
      supabase.from('submissions').select('*'),
      supabase.from('progress').select('*'),
      supabase.from('gamification').select('*'),
      supabase.from('completions').select('*'),
    ])
    setSubjects(s || [])
    setUsers(u || [])
    setDecks(d || [])
    setModules(m || [])
    setLessons(l || [])
    setHomework(h || [])
    setSubmissions(sb || [])
    setProgress(p || [])
    const gamiMap = {}
    ;(g || []).forEach(row => { gamiMap[row.userId] = row })
    setGamification(gamiMap)
    setCompletions(c || [])
    setDataLoading(false)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (currentUser) {
      loadAll()
    } else {
      clearAll()
      setDataLoading(false)
    }
  }, [authLoading, currentUser?.id, loadAll])

  // ── Subjects ──────────────────────────────────────────────
  const getSubjects = () => subjects
  const saveSubject = async (subject) => {
    const obj = { ...subject, id: subject.id || genId('subj') }
    setSubjects(prev => { const i = prev.findIndex(s => s.id === obj.id); if (i >= 0) { const n = [...prev]; n[i] = obj; return n } return [...prev, obj] })
    await supabase.from('subjects').upsert(obj)
  }
  const deleteSubject = async (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id))
    await supabase.from('subjects').delete().eq('id', id)
  }

  // ── Users (profiles) ──────────────────────────────────────
  const getUsers = () => users
  const saveUser = async (user) => {
    setUsers(prev => { const i = prev.findIndex(u => u.id === user.id); if (i >= 0) { const n = [...prev]; n[i] = user; return n } return prev })
    await supabase.from('profiles').update(user).eq('id', user.id)
  }
  const deactivateUser = async (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: false } : u))
    await supabase.from('profiles').update({ active: false }).eq('id', id)
  }

  // ── Decks ─────────────────────────────────────────────────
  const getDecks = () => decks
  const getDeck  = (id) => decks.find(d => d.id === id) || null
  const saveDeck = async (deck) => {
    const obj = { ...deck, id: deck.id || genId('deck'), createdAt: deck.createdAt || new Date().toISOString() }
    setDecks(prev => { const i = prev.findIndex(d => d.id === obj.id); if (i >= 0) { const n = [...prev]; n[i] = obj; return n } return [...prev, obj] })
    await supabase.from('decks').upsert(obj)
    return obj
  }
  const deleteDeck = async (id) => {
    setDecks(prev => prev.filter(d => d.id !== id))
    await supabase.from('decks').delete().eq('id', id)
  }

  // ── Modules ───────────────────────────────────────────────
  const getModules = () => modules
  const saveModule = async (mod) => {
    const obj = { ...mod, id: mod.id || genId('mod'), lessonIds: mod.lessonIds || [], assignedTo: mod.assignedTo || [], createdAt: mod.createdAt || new Date().toISOString() }
    setModules(prev => { const i = prev.findIndex(m => m.id === obj.id); if (i >= 0) { const n = [...prev]; n[i] = obj; return n } return [...prev, obj] })
    await supabase.from('modules').upsert(obj)
  }
  const deleteModule = async (id) => {
    setModules(prev => prev.filter(m => m.id !== id))
    await supabase.from('modules').delete().eq('id', id)
  }

  // ── Lessons ───────────────────────────────────────────────
  const getLessons = () => lessons
  const saveLesson = async (lesson) => {
    const isNew = !lessons.find(l => l.id === lesson.id)
    const obj = { ...lesson, id: lesson.id || genId('les') }
    setLessons(prev => { const i = prev.findIndex(l => l.id === obj.id); if (i >= 0) { const n = [...prev]; n[i] = obj; return n } return [...prev, obj] })
    if (isNew) {
      setModules(prev => prev.map(m => m.id === obj.moduleId && !m.lessonIds.includes(obj.id) ? { ...m, lessonIds: [...m.lessonIds, obj.id] } : m))
      const mod = modules.find(m => m.id === obj.moduleId)
      if (mod && !mod.lessonIds.includes(obj.id)) {
        await supabase.from('modules').update({ lessonIds: [...mod.lessonIds, obj.id] }).eq('id', obj.moduleId)
      }
    }
    await supabase.from('lessons').upsert(obj)
  }
  const deleteLesson = async (id) => {
    const lesson = lessons.find(l => l.id === id)
    setLessons(prev => prev.filter(l => l.id !== id))
    if (lesson) {
      const mod = modules.find(m => m.id === lesson.moduleId)
      const newIds = (mod?.lessonIds || []).filter(lid => lid !== id)
      setModules(prev => prev.map(m => m.id === lesson.moduleId ? { ...m, lessonIds: newIds } : m))
      await supabase.from('lessons').delete().eq('id', id)
      if (mod) await supabase.from('modules').update({ lessonIds: newIds }).eq('id', mod.id)
    }
  }

  // ── Homework ──────────────────────────────────────────────
  const getHomework = () => homework
  const saveHomework = async (hw) => {
    const obj = { ...hw, id: hw.id || genId('hw'), assignedTo: hw.assignedTo || [], createdAt: hw.createdAt || new Date().toISOString() }
    setHomework(prev => { const i = prev.findIndex(h => h.id === obj.id); if (i >= 0) { const n = [...prev]; n[i] = obj; return n } return [...prev, obj] })
    await supabase.from('homework').upsert(obj)
  }
  const deleteHomework = async (id) => {
    setHomework(prev => prev.filter(h => h.id !== id))
    await supabase.from('homework').delete().eq('id', id)
  }

  // ── Submissions ───────────────────────────────────────────
  const getSubmissions = () => submissions
  const saveSubmission = async (sub) => {
    const obj = { ...sub, id: sub.id || genId('sub'), submittedAt: new Date().toISOString() }
    setSubmissions(prev => [...prev, obj])
    await supabase.from('submissions').insert(obj)
    return obj
  }
  const updateSubmission = async (id, updates) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    await supabase.from('submissions').update(updates).eq('id', id)
  }

  // ── Progress (study sessions) ─────────────────────────────
  const getProgress = () => progress
  const saveProgress = async (entry) => {
    const obj = { ...entry, id: entry.id || genId('prog') }
    setProgress(prev => [...prev, obj])
    await supabase.from('progress').insert(obj)
  }

  // ── Gamification ──────────────────────────────────────────
  const getUserGamification = (userId) => {
    return gamification[userId] || {
      userId, totalXP: 0, weeklyPoints: 0, currentStreak: 0,
      longestStreak: 0, lastStudyDate: null, badges: [], totalCorrect: 0, totalSessions: 0,
    }
  }
  const setUserGamification = async (userId, data) => {
    const obj = { ...data, userId }
    setGamification(prev => ({ ...prev, [userId]: obj }))
    await supabase.from('gamification').upsert(obj)
  }
  const getAllGamification = () => gamification

  // ── Completions ───────────────────────────────────────────
  const getCompletions = (userId) => completions.filter(c => c.userId === userId)
  const completeLesson = async (userId, lessonId) => {
    if (completions.find(c => c.userId === userId && c.lessonId === lessonId)) return
    const obj = { userId, lessonId, completedAt: new Date().toISOString() }
    setCompletions(prev => [...prev, obj])
    await supabase.from('completions').upsert(obj)
  }

  return (
    <DataContext.Provider value={{
      dataLoading,
      getSubjects, saveSubject, deleteSubject,
      getUsers, saveUser, deactivateUser,
      getDecks, getDeck, saveDeck, deleteDeck,
      getModules, saveModule, deleteModule,
      getLessons, saveLesson, deleteLesson,
      getHomework, saveHomework, deleteHomework,
      getSubmissions, saveSubmission, updateSubmission,
      getProgress, saveProgress,
      getUserGamification, setUserGamification, getAllGamification,
      getCompletions, completeLesson,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
