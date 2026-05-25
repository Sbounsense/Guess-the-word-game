import { createContext, useContext, useState } from 'react'
import { storage } from '../services/storage.js'
import { calcSessionXP, calcSessionPoints, checkNewBadges } from '../utils/gamification.js'
import { updateStreak } from '../utils/streaks.js'
import { BADGE_DEFS } from '../data/badges.js'

const GamificationContext = createContext(null)

export function GamificationProvider({ children }) {
  const [toast, setToast] = useState(null)
  const [newBadges, setNewBadges] = useState([])

  const getUserStats = (userId) => storage.getUserGamification(userId)

  const recordSession = (userId, { correct, total, isPerfect }) => {
    let stats = storage.getUserGamification(userId)
    stats = updateStreak(stats)

    const xp = calcSessionXP(correct, total)
    const pts = calcSessionPoints(correct, total)

    stats.totalXP = (stats.totalXP || 0) + xp
    stats.weeklyPoints = (stats.weeklyPoints || 0) + pts
    stats.totalCorrect = (stats.totalCorrect || 0) + correct
    stats.totalSessions = (stats.totalSessions || 0) + 1
    stats._lastSessionPerfect = isPerfect

    const earned = checkNewBadges(stats, BADGE_DEFS)
    if (earned.length > 0) {
      stats.badges = [...(stats.badges || []), ...earned]
      setNewBadges(earned)
    }

    storage.setUserGamification(userId, stats)
    setToast({ xp, pts })
    setTimeout(() => setToast(null), 2500)

    return { xp, pts, earned }
  }

  const dismissBadges = () => setNewBadges([])

  return (
    <GamificationContext.Provider value={{ getUserStats, recordSession, toast, newBadges, dismissBadges }}>
      {children}
    </GamificationContext.Provider>
  )
}

export const useGamification = () => useContext(GamificationContext)
