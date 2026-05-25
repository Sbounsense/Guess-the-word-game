import { BADGE_DEFS } from '../../data/badges.js'
import styles from './BadgeGrid.module.css'

export default function BadgeGrid({ earnedIds = [] }) {
  return (
    <div className={styles.grid}>
      {BADGE_DEFS.map(b => {
        const earned = earnedIds.includes(b.id)
        return (
          <div key={b.id} className={`${styles.badge} ${earned ? styles.earned : styles.locked}`} title={b.description}>
            <span className={styles.icon}>{b.icon}</span>
            <span className={styles.name}>{b.name}</span>
            {!earned && <span className={styles.lock}>🔒</span>}
          </div>
        )
      })}
    </div>
  )
}
