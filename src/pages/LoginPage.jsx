import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase, supabaseConfigured } from '../services/supabase.js'
import Button from '../components/ui/Button.jsx'
import styles from './LoginPage.module.css'

function networkErrorMessage(err) {
  const msg = err?.message || ''
  if (msg.toLowerCase().includes('load failed') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
    return 'Cannot reach the server. Your Supabase project may be paused — go to supabase.com, open your project and click "Restore". Then try again.'
  }
  return msg || 'An unexpected error occurred. Please try again.'
}

export default function LoginPage() {
  const { currentUser, signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab]             = useState('login')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [name, setName]           = useState('')
  const [role, setRole]           = useState('student')
  const [error, setError]         = useState('')
  const [info, setInfo]           = useState('')
  const [submitting, setSubmitting]= useState(false)
  const [reachable, setReachable] = useState(null)

  useEffect(() => {
    if (currentUser) navigate(`/${currentUser.role}`, { replace: true })
  }, [currentUser])

  // Quick reachability probe — pings the auth endpoint
  useEffect(() => {
    if (!supabaseConfigured) return
    supabase.auth.getSession()
      .then(() => setReachable(true))
      .catch(() => setReachable(false))
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
    } catch (err) {
      setError(networkErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your name.'); return }
    setSubmitting(true); setError('')
    try {
      const { data, error } = await signUp(email, password, name.trim(), role)
      if (error) { setError(error.message); return }
      if (!data?.session) {
        setInfo('Account created! Check your email to confirm, then sign in.')
        setTab('login')
      }
    } catch (err) {
      setError(networkErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const blocked = submitting || !supabaseConfigured || reachable === false

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>E</div>
        <h1 className={styles.title}>EduQuest</h1>
        <p className={styles.sub}>Education Centre Platform</p>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'login'  ? styles.active : ''}`} onClick={() => { setTab('login');  setError(''); setInfo('') }}>Sign In</button>
          <button className={`${styles.tab} ${tab === 'signup' ? styles.active : ''}`} onClick={() => { setTab('signup'); setError(''); setInfo('') }}>Create Account</button>
        </div>

        {!supabaseConfigured && (
          <div className={styles.error}>
            ⚠️ Supabase is not connected. Add <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> to your Vercel environment variables, then trigger a new deployment.
          </div>
        )}

        {supabaseConfigured && reachable === false && (
          <div className={styles.error}>
            ⚠️ Cannot reach your Supabase project. It may be paused (free tier pauses after 1 week). Go to <strong>supabase.com → your project → click Restore</strong>, wait 30 seconds, then refresh this page.
          </div>
        )}

        {supabaseConfigured && reachable === true && (
          <div className={styles.connected}>✓ Connected to database</div>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {info  && <div className={styles.info}>{info}</div>}

        {tab === 'login' && (
          <form className={styles.form} onSubmit={handleLogin}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus required />
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" variant="primary" size="lg" style={{ width: '100%', marginTop: 8 }} disabled={blocked}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        )}

        {tab === 'signup' && (
          <form className={styles.form} onSubmit={handleSignUp}>
            <label className={styles.label}>Your name</label>
            <input className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" required autoFocus />
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            <label className={styles.label}>Password (min 6 characters)</label>
            <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            <label className={styles.label}>Role</label>
            <div className={styles.roleGroup}>
              {['student','teacher','admin'].map(r => (
                <button key={r} type="button"
                  className={`${styles.roleBtn} ${role === r ? styles.roleActive : ''}`}
                  onClick={() => setRole(r)}>
                  {r === 'student' ? '🧑‍🎓' : r === 'teacher' ? '🧑‍🏫' : '⚙️'} {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            <Button type="submit" variant="primary" size="lg" style={{ width: '100%', marginTop: 8 }} disabled={blocked}>
              {submitting ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
