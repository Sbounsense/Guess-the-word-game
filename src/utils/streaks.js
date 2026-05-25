const today = () => new Date().toISOString().slice(0, 10)

const daysBetween = (a, b) => {
  const ms = new Date(b) - new Date(a)
  return Math.round(ms / 86400000)
}

export function updateStreak(gamification) {
  const t = today()
  const last = gamification.lastStudyDate

  if (last === t) return gamification

  const diff = last ? daysBetween(last, t) : null
  const newStreak = diff === 1 ? gamification.currentStreak + 1 : 1
  const longestStreak = Math.max(gamification.longestStreak, newStreak)

  return { ...gamification, currentStreak: newStreak, longestStreak, lastStudyDate: t }
}
