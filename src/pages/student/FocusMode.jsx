import { useState, useEffect, useRef } from 'react'
import Button from '../../components/ui/Button.jsx'
import styles from './FocusMode.module.css'

const MODES = [
  { key: 'focus',       label: 'Focus',       minutes: 25, color: 'var(--primary)' },
  { key: 'short',       label: 'Short Break', minutes: 5,  color: '#22c55e' },
  { key: 'long',        label: 'Long Break',  minutes: 15, color: '#a855f7' },
]

const CIRCUMFERENCE = 2 * Math.PI * 80

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function FocusMode() {
  const [modeIndex, setModeIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].minutes * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)
  const completedRef = useRef(false)

  const mode = MODES[modeIndex]
  const totalSeconds = mode.minutes * 60
  const elapsed = totalSeconds - secondsLeft
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  const minutes = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const timeStr = `${pad(minutes)}:${pad(secs)}`

  // Reset when mode changes
  useEffect(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setSecondsLeft(MODES[modeIndex].minutes * 60)
    completedRef.current = false
    document.title = 'EduQuest · Focus Mode'
  }, [modeIndex])

  // Countdown tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (!completedRef.current) {
              completedRef.current = true
              if (modeIndex === 0) {
                setSessions(s => s + 1)
              }
              document.title = '✓ Time’s up!'
              setTimeout(() => {
                document.title = 'EduQuest · Focus Mode'
              }, 4000)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, modeIndex])

  // Restore title on unmount
  useEffect(() => {
    return () => {
      document.title = 'EduQuest'
    }
  }, [])

  function handleModeChange(i) {
    if (i === modeIndex) return
    setModeIndex(i)
  }

  function handleStartPause() {
    if (secondsLeft === 0) return
    setRunning(r => !r)
  }

  function handleReset() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setSecondsLeft(mode.minutes * 60)
    completedRef.current = false
    document.title = 'EduQuest · Focus Mode'
  }

  return (
    <div className="page">
      <h1 className="page-title">Focus Mode</h1>

      {/* Mode tabs */}
      <div className={styles.modeTabs}>
        {MODES.map((m, i) => (
          <button
            key={m.key}
            className={`${styles.modeTab} ${modeIndex === i ? styles.modeTabActive : ''}`}
            style={modeIndex === i ? { background: m.color, borderColor: m.color } : {}}
            onClick={() => handleModeChange(i)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer SVG */}
      <div className={styles.timerSection}>
        <svg
          className={styles.timerSvg}
          viewBox="0 0 200 200"
          aria-label={`Timer: ${timeStr}`}
        >
          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="var(--border)"
            strokeWidth="10"
          />
          {/* Progress arc */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={mode.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
            style={{ transition: running ? 'stroke-dashoffset 0.9s linear' : 'none' }}
          />
          {/* Time display */}
          <text
            x="100"
            y="108"
            textAnchor="middle"
            fontSize="32"
            fontWeight="700"
            fill="var(--text)"
            fontFamily="var(--font)"
          >
            {timeStr}
          </text>
        </svg>

        <p className={styles.modeLabel} style={{ color: mode.color }}>
          {mode.label}
        </p>

        <div className={styles.controls}>
          <Button
            variant={running ? 'secondary' : 'primary'}
            onClick={handleStartPause}
            disabled={secondsLeft === 0}
          >
            {running ? 'Pause' : secondsLeft === totalSeconds ? 'Start' : 'Resume'}
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>

        <p className={styles.sessionCounter}>
          🍅 {sessions} session{sessions !== 1 ? 's' : ''} completed today
        </p>
      </div>
    </div>
  )
}
