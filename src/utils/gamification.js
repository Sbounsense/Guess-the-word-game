export const LEVELS = [
  { level: 1, label: 'Beginner',  xp: 0 },
  { level: 2, label: 'Explorer',  xp: 100 },
  { level: 3, label: 'Scholar',   xp: 250 },
  { level: 4, label: 'Expert',    xp: 500 },
  { level: 5, label: 'Master',    xp: 850 },
  { level: 6, label: 'Champion',  xp: 1300 },
  { level: 7, label: 'Legend',    xp: 1900 },
  { level: 8, label: 'Sage',      xp: 2650 },
  { level: 9, label: 'Luminary',  xp: 3600 },
  { level: 10, label: 'Grandmaster', xp: 5000 },
]

export function calcLevel(totalXP) {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (totalXP >= lvl.xp) current = lvl
    else break
  }
  const nextLvl = LEVELS.find(l => l.xp > totalXP)
  const nextXP = nextLvl ? nextLvl.xp : current.xp + 2000
  const prevXP = current.xp
  const progress = nextLvl
    ? Math.round(((totalXP - prevXP) / (nextXP - prevXP)) * 100)
    : 100
  return { ...current, nextXP, progress }
}

export function calcSessionXP(correct, total, isFirstSession = false) {
  let xp = correct * 5
  if (correct === total && total >= 5) xp += 30
  if (isFirstSession) xp += 10
  return xp
}

export function calcSessionPoints(correct, total) {
  let pts = correct * 10
  if (correct === total && total >= 5) pts += 50
  return pts
}

export function checkNewBadges(stats, badgeDefs) {
  return badgeDefs.filter(b => {
    if (stats.badges.includes(b.id)) return false
    return b.condition(stats)
  }).map(b => b.id)
}
