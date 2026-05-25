import { calcLevel } from '../../utils/gamification.js'
import styles from './XPBar.module.css'

export default function XPBar({ totalXP }) {
  const lvl = calcLevel(totalXP)

  return (
    <div className={styles.wrap}>
      <div className={styles.labels}>
        <span className={styles.level}>Level {lvl.level} — {lvl.label}</span>
        <span className={styles.xp}>{totalXP} / {lvl.nextXP} XP</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${lvl.progress}%` }} />
      </div>
    </div>
  )
}
