import { createContext, useContext, useState, useCallback } from 'react'
import { storage } from '../services/storage.js'
import { genId } from '../utils/id.js'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick(t => t + 1), [])

  // Subjects
  const getSubjects = () => storage.getSubjects()
  const saveSubject = (subject) => {
    const all = storage.getSubjects()
    const idx = all.findIndex(s => s.id === subject.id)
    if (idx >= 0) all[idx] = subject
    else all.push({ ...subject, id: subject.id || genId('subj') })
    storage.setSubjects(all)
    refresh()
  }
  const deleteSubject = (id) => {
    storage.setSubjects(storage.getSubjects().filter(s => s.id !== id))
    refresh()
  }

  // Users
  const getUsers = () => storage.getUsers()
  const saveUser = (user) => {
    const all = storage.getUsers()
    const idx = all.findIndex(u => u.id === user.id)
    if (idx >= 0) all[idx] = user
    else all.push({ ...user, id: genId('usr'), createdAt: new Date().toISOString() })
    storage.setUsers(all)
    refresh()
    return all.find(u => u.name === user.name && u.role === user.role) || user
  }
  const deactivateUser = (id) => {
    const all = storage.getUsers().map(u => u.id === id ? { ...u, active: false } : u)
    storage.setUsers(all)
    refresh()
  }

  // Decks
  const getDecks = () => storage.getDecks()
  const getDeck = (id) => storage.getDeck(id)
  const saveDeck = (deck) => {
    const all = storage.getDecks()
    const idx = all.findIndex(d => d.id === deck.id)
    const now = new Date().toISOString()
    if (idx >= 0) {
      all[idx] = { ...deck, updatedAt: now }
    } else {
      const newDeck = { ...deck, id: deck.id || genId('deck'), createdAt: now }
      all.push(newDeck)
    }
    storage.setDecks(all)
    refresh()
    return storage.getDeck(deck.id) || deck
  }
  const deleteDeck = (id) => {
    storage.setDecks(storage.getDecks().filter(d => d.id !== id))
    refresh()
  }

  // Modules
  const getModules = () => storage.getModules()
  const saveModule = (mod) => {
    const all = storage.getModules()
    const idx = all.findIndex(m => m.id === mod.id)
    if (idx >= 0) all[idx] = mod
    else all.push({ ...mod, id: mod.id || genId('mod'), lessonIds: [], createdAt: new Date().toISOString() })
    storage.setModules(all)
    refresh()
  }
  const deleteModule = (id) => {
    storage.setModules(storage.getModules().filter(m => m.id !== id))
    refresh()
  }

  // Lessons
  const getLessons = () => storage.getLessons()
  const saveLesson = (lesson) => {
    const all = storage.getLessons()
    const idx = all.findIndex(l => l.id === lesson.id)
    if (idx >= 0) {
      all[idx] = lesson
    } else {
      const newLesson = { ...lesson, id: lesson.id || genId('les') }
      all.push(newLesson)
      // add to module's lessonIds
      const modules = storage.getModules()
      const modIdx = modules.findIndex(m => m.id === lesson.moduleId)
      if (modIdx >= 0 && !modules[modIdx].lessonIds.includes(newLesson.id)) {
        modules[modIdx].lessonIds.push(newLesson.id)
        storage.setModules(modules)
      }
    }
    storage.setLessons(all)
    refresh()
  }
  const deleteLesson = (id) => {
    const lesson = storage.getLessons().find(l => l.id === id)
    storage.setLessons(storage.getLessons().filter(l => l.id !== id))
    if (lesson) {
      const modules = storage.getModules().map(m => ({
        ...m,
        lessonIds: m.lessonIds.filter(lid => lid !== id),
      }))
      storage.setModules(modules)
    }
    refresh()
  }

  // Homework
  const getHomework = () => storage.getHomework()
  const saveHomework = (hw) => {
    const all = storage.getHomework()
    const idx = all.findIndex(h => h.id === hw.id)
    if (idx >= 0) all[idx] = hw
    else all.push({ ...hw, id: hw.id || genId('hw'), createdAt: new Date().toISOString() })
    storage.setHomework(all)
    refresh()
  }
  const deleteHomework = (id) => {
    storage.setHomework(storage.getHomework().filter(h => h.id !== id))
    refresh()
  }

  // Submissions
  const getSubmissions = () => storage.getSubmissions()
  const saveSubmission = (sub) => {
    const all = storage.getSubmissions()
    const newSub = { ...sub, id: sub.id || genId('sub'), submittedAt: new Date().toISOString() }
    all.push(newSub)
    storage.setSubmissions(all)
    refresh()
    return newSub
  }

  return (
    <DataContext.Provider value={{
      tick,
      getSubjects, saveSubject, deleteSubject,
      getUsers, saveUser, deactivateUser,
      getDecks, getDeck, saveDeck, deleteDeck,
      getModules, saveModule, deleteModule,
      getLessons, saveLesson, deleteLesson,
      getHomework, saveHomework, deleteHomework,
      getSubmissions, saveSubmission,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
