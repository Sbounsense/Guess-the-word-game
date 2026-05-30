import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../services/supabase.js' // used for password reset
import Button from '../components/ui/Button.jsx'
import styles from './LoginPage.module.css'

const COLORS = ['#ff7a7a','#4dabf7','#69db7c','#ffd43b','#cc5de8','#ff8c42','#38d9a9']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// mode: 'signin' | 'signup' | 'forgot'

export default function LoginPage() {
  const { currentUser, login, signup } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signin')

  // sign-in fields
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  // sign-up fields
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suConfirm, setSuConfirm] = useState('')

  // forgot-password fields
  const [fpEmail, setFpEmail] = useState('')
  const [fpSent, setFpSent] = useState(false)

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState(null) // non-null = show verify screen
  const [resendSent, setResendSent] = useState(false)

  useEffect(() => {
    if (currentUser) navigate(`/${currentUser.role}`, { replace: true })
  }, [currentUser, navigate])

  const switchMode = (next) => {
    setMode(next)
    setError('')
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(siEmail.trim().toLowerCase(), siPassword)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    const email = suEmail.trim().toLowerCase()
    const name = suName.trim()
    if (!name) { setError('Name is required.'); return }
    if (name.length > 100) { setError('Name must be 100 characters or fewer.'); return }
    if (!EMAIL_RE.test(email)) { setError('Enter a valid email address.'); return }
    if (suPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (suPassword !== suConfirm) { setError('Passwords do not match.'); return }
    setSubmitting(true)
    try {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const { needsConfirmation } = await signup(email, suPassword, name, 'student', color)
      if (needsConfirmation) {
        setVerifyEmail(email)
      }
      // if needsConfirmation is false, onAuthStateChange fires and navigates automatically
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendConfirmation = async () => {
    setError('')
    setResendSent(false)
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: verifyEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setResendSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        fpEmail.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/login` }
      )
      if (error) throw error
      setFpSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Email verification pending ──────────────────────────────────
  if (verifyEmail) {
    return (
      <div className={styles.page}>
        <div className={styles.formPanel}>
          <div className={styles.card}>
            <div className={styles.logo}>📧</div>
            <h1 className={styles.title}>Check your email</h1>
            <p className={styles.sub} style={{ textAlign: 'center', marginTop: 8 }}>
              We sent a verification link to<br /><strong>{verifyEmail}</strong>.<br /><br />
              Click the link in the email to activate your account.
            </p>
            {error && <p className={styles.error}>{error}</p>}
            {resendSent && (
              <p style={{ textAlign: 'center', color: 'var(--success, #69db7c)', fontSize: '0.88rem', marginTop: 8 }}>
                ✓ Confirmation email resent.
              </p>
            )}
            <Button variant="secondary" style={{ width: '100%', marginTop: 16 }}
              disabled={submitting}
              onClick={handleResendConfirmation}>
              {submitting ? 'Sending…' : 'Resend confirmation email'}
            </Button>
            <Button variant="secondary" style={{ width: '100%', marginTop: 8 }}
              onClick={() => { setVerifyEmail(null); setResendSent(false); setMode('signin') }}>
              ← Back to sign in
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Forgot password sent ────────────────────────────────────────
  if (mode === 'forgot' && fpSent) {
    return (
      <div className={styles.page}>
        <div className={styles.formPanel}>
          <div className={styles.card}>
            <div className={styles.logo}>📬</div>
            <h1 className={styles.title}>Email sent</h1>
            <p className={styles.sub} style={{ textAlign: 'center', marginTop: 8 }}>
              A password reset link was sent to<br /><strong>{fpEmail}</strong>.<br /><br />
              Check your inbox and click the link to set a new password.
            </p>
            <Button variant="secondary" style={{ width: '100%', marginTop: 24 }}
              onClick={() => { setFpSent(false); setFpEmail(''); switchMode('signin') }}>
              ← Back to sign in
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Forgot password form ────────────────────────────────────────
  if (mode === 'forgot') {
    return (
      <div className={styles.page}>
        <div className={styles.formPanel}>
          <div className={styles.card}>
            <div className={styles.logo}>🔑</div>
            <h1 className={styles.title}>Reset password</h1>
            <p className={styles.sub}>Enter your email and we'll send a reset link.</p>

            {error && <p className={styles.error}>{error}</p>}

            <form className={styles.form} onSubmit={handleForgotPassword}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                value={fpEmail}
                onChange={e => setFpEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                required
              />
              <Button type="submit" variant="primary" size="lg"
                style={{ width: '100%', marginTop: 8 }} disabled={submitting}>
                {submitting ? 'Sending…' : 'Send reset link'}
              </Button>
              <button type="button" className={styles.forgotLink}
                style={{ alignSelf: 'center', marginTop: 4 }}
                onClick={() => switchMode('signin')}>
                ← Back to sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── Sign in / Sign up ───────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.brand}>
        <div className={styles.brandOrb1} />
        <div className={styles.brandOrb2} />
        <div className={styles.brandOrb3} />
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>🎓</div>
          <h1 className={styles.brandTitle}>Learn smarter,<br />level up faster.</h1>
          <p className={styles.brandSub}>EduQuest turns studying into an adventure — earn XP, unlock badges, and climb the leaderboard.</p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🎮</div>
              <div className={styles.featureText}>
                <h3>3 Game Modes</h3>
                <p>Flashcards, quizzes, and word challenges</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>⚡</div>
              <div className={styles.featureText}>
                <h3>XP & Levels</h3>
                <p>Earn points and climb from Beginner to Grandmaster</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔥</div>
              <div className={styles.featureText}>
                <h3>Daily Streaks</h3>
                <p>Build habits with daily study streaks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.logo}>🎓</div>
          <h1 className={styles.title}>EduQuest</h1>
          <p className={styles.sub}>Education Centre Platform</p>

          <div className={styles.tabs}>
            <button className={`${styles.tab} ${mode === 'signin' ? styles.active : ''}`}
              onClick={() => switchMode('signin')}>
              Sign In
            </button>
            <button className={`${styles.tab} ${mode === 'signup' ? styles.active : ''}`}
              onClick={() => switchMode('signup')}>
              Create Account
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {mode === 'signin' && (
            <form className={styles.form} onSubmit={handleSignIn}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" value={siEmail}
                onChange={e => setSiEmail(e.target.value)} placeholder="you@example.com"
                autoComplete="email" autoFocus required />
              <label className={styles.label}>Password</label>
              <input className={styles.input} type="password" value={siPassword}
                onChange={e => setSiPassword(e.target.value)} placeholder="••••••••"
                autoComplete="current-password" required />
              <button type="button" className={styles.forgotLink} onClick={() => switchMode('forgot')}>
                Forgot password?
              </button>
              <Button type="submit" variant="primary" size="lg"
                style={{ width: '100%', marginTop: 8 }} disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          )}

          {mode === 'signup' && (
            <form className={styles.form} onSubmit={handleSignUp}>
              <label className={styles.label}>Your name</label>
              <input className={styles.input} value={suName}
                onChange={e => setSuName(e.target.value)} placeholder="e.g. Alex"
                autoComplete="name" autoFocus required />
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" value={suEmail}
                onChange={e => setSuEmail(e.target.value)} placeholder="you@example.com"
                autoComplete="email" required />
              <label className={styles.label}>Password</label>
              <input className={styles.input} type="password" value={suPassword}
                onChange={e => setSuPassword(e.target.value)} placeholder="min 8 characters"
                autoComplete="new-password" minLength={8} required />
              <label className={styles.label}>Confirm password</label>
              <input className={styles.input} type="password" value={suConfirm}
                onChange={e => setSuConfirm(e.target.value)} placeholder="repeat password"
                autoComplete="new-password" required />
              <p className={styles.roleNote}>🧑‍🎓 All new accounts are student accounts. Teachers and admins are set up by your administrator.</p>
              <Button type="submit" variant="primary" size="lg"
                style={{ width: '100%', marginTop: 8 }} disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Account'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
