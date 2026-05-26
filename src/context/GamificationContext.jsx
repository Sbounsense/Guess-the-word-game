import { createContext, useContext, useState } from 'react'
import { useData } from './DataContext.jsx'
import { calcSessionXP, calcSessionPoints, checkNewBadges } from '../utils/gamification.js'
import { updateStreak } from '../utils/streaks.js'
import { BADGE_DEFS } from '../data/badges.js'

const GamificationContext = createContext(null)

export function GamificationProvider({ children }) {
  const [toast, setToast] = useState(null)
  const [newBadges, setNewBadges] = useState([])
  const { getUserGamification, setUserGamification, saveProgress } = useData()

  const getUserStats = (userId) => getUserGamification(userId)

  const recordSession = async (userId, { correct, total, isPerfect, deckId, mode }) => {
    let stats = getUserGamification(userId)
    stats = updateStreak(stats)

    const xp  = calcSessionXP(correct, total)
    const pts = calcSessionPoints(correct, total)

    stats.totalXP      = (stats.totalXP      || 0) + xp
    stats.weeklyPoints = (stats.weeklyPoints  || 0) + pts
    stats.totalCorrect = (stats.totalCorrect  || 0) + correct
    stats.totalSessions= (stats.totalSessions || 0) + 1
    stats._lastSessionPerfect = isPerfect

    const earned = checkNewBadges(stats, BADGE_DEFS)
    if (earned.length > 0) {
      stats.badges = [...(stats.badges || []), ...earned]
      setNewBadges(earned)
    }

    await setUserGamification(userId, stats)

    await saveProgress({
      userId,
      deckId,
      sessionDate: new Date().toISOString().slice(0, 10),
      score: correct,
      total,
      xpEarned: xp,
      mode,
    })

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
