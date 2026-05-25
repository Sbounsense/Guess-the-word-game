const KEYS = {
  USERS: 'eq_users',
  CURRENT_USER: 'eq_current_user_id',
  SUBJECTS: 'eq_subjects',
  MODULES: 'eq_modules',
  LESSONS: 'eq_lessons',
  HOMEWORK: 'eq_homework',
  SUBMISSIONS: 'eq_submissions',
  DECKS: 'eq_decks',
  PROGRESS: 'eq_progress',
  GAMIFICATION: 'eq_gamification',
  SEEDED: 'eq_seeded',
}

const get = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const set = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  // Users
  getUsers: () => get(KEYS.USERS) || [],
  setUsers: (v) => set(KEYS.USERS, v),
  getUser: (id) => (get(KEYS.USERS) || []).find(u => u.id === id) || null,

  // Current session
  getCurrentUserId: () => get(KEYS.CURRENT_USER),
  setCurrentUserId: (id) => set(KEYS.CURRENT_USER, id),
  clearCurrentUser: () => localStorage.removeItem(KEYS.CURRENT_USER),

  // Subjects
  getSubjects: () => get(KEYS.SUBJECTS) || [],
  setSubjects: (v) => set(KEYS.SUBJECTS, v),

  // Modules
  getModules: () => get(KEYS.MODULES) || [],
  setModules: (v) => set(KEYS.MODULES, v),

  // Lessons
  getLessons: () => get(KEYS.LESSONS) || [],
  setLessons: (v) => set(KEYS.LESSONS, v),

  // Homework
  getHomework: () => get(KEYS.HOMEWORK) || [],
  setHomework: (v) => set(KEYS.HOMEWORK, v),

  // Submissions
  getSubmissions: () => get(KEYS.SUBMISSIONS) || [],
  setSubmissions: (v) => set(KEYS.SUBMISSIONS, v),

  // Decks
  getDecks: () => get(KEYS.DECKS) || [],
  setDecks: (v) => set(KEYS.DECKS, v),
  getDeck: (id) => (get(KEYS.DECKS) || []).find(d => d.id === id) || null,

  // Progress
  getProgress: () => get(KEYS.PROGRESS) || [],
  setProgress: (v) => set(KEYS.PROGRESS, v),

  // Gamification
  getGamification: () => get(KEYS.GAMIFICATION) || {},
  setGamification: (v) => set(KEYS.GAMIFICATION, v),
  getUserGamification: (userId) => {
    const all = get(KEYS.GAMIFICATION) || {}
    return all[userId] || {
      userId,
      totalXP: 0,
      weeklyPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      badges: [],
      totalCorrect: 0,
      totalSessions: 0,
    }
  },
  setUserGamification: (userId, data) => {
    const all = get(KEYS.GAMIFICATION) || {}
    all[userId] = data
    set(KEYS.GAMIFICATION, all)
  },

  // Seed flag
  isSeeded: () => !!get(KEYS.SEEDED),
  markSeeded: () => set(KEYS.SEEDED, true),
}
