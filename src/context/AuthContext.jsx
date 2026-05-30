import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabase.js'

const AuthContext = createContext(null)

async function fetchProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // Tracks whether a deferred SIGNED_IN profile fetch is still in-flight.
  // INITIAL_SESSION must not clear loading until any pending fetch has settled,
  // otherwise ProtectedRoute sees loading=false + currentUser=null and
  // redirects to /login even though authentication is still resolving.
  const pendingSignedIn = useRef(false)

  useEffect(() => {
    let active = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!active) return

        if (event === 'INITIAL_SESSION') {
          // Fired after initialization completes (lock released) — safe to call fetchProfile.
          // If a SIGNED_IN event already started a deferred fetch (pendingSignedIn),
          // let that fetch own the loading transition to avoid a race where this
          // branch sets currentUser=null before the SIGNED_IN fetch resolves.
          if (pendingSignedIn.current) return

          let user = null
          try {
            if (session?.user) {
              const profile = await fetchProfile(session.user.id)
              if (profile && profile.active !== false) user = profile
            }
          } catch {
            // network error — treat as logged out
          }
          if (active) {
            setCurrentUser(user)
            setLoading(false)
          }
          return
        }

        if (event === 'SIGNED_IN') {
          // Could be fired during initialization (inside the auth lock) or after user login.
          // Calling fetchProfile here risks deadlocking because supabase.from() calls
          // getSession() which waits for the same lock.
          // Defer profile fetch to a new macrotask to escape the lock context.
          const userId = session?.user?.id
          if (!userId) return
          pendingSignedIn.current = true
          setTimeout(async () => {
            if (!active) return
            try {
              const profile = await fetchProfile(userId)
              if (!active) return
              if (profile && profile.active !== false) {
                setCurrentUser(profile)
              } else {
                setCurrentUser(null)
                await supabase.auth.signOut()
              }
            } catch {
              if (active) setCurrentUser(null)
            } finally {
              // Always release loading once the deferred fetch settles so that
              // ProtectedRoute unblocks regardless of success or failure.
              if (active) {
                pendingSignedIn.current = false
                setLoading(false)
              }
            }
          }, 0)
          return
        }

        if (event === 'TOKEN_REFRESHED') {
          // Session refreshed — update the user if needed (no lock-related issues here)
          return
        }

        if (event === 'SIGNED_OUT') {
          if (active) {
            pendingSignedIn.current = false
            setCurrentUser(null)
          }
          return
        }
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signup = async (email, password, name, _role, avatarColor) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, avatarColor } },
      // role is intentionally omitted — DB trigger always assigns 'student'
    })
    if (error) throw error
    // If Supabase auto-confirmed the account (email confirmation disabled in the
    // dashboard), sign out the auto-created session so the user must verify below.
    if (data.session) {
      await supabase.auth.signOut()
    }
    // Send a magic-link OTP for email verification. This triggers an actual email
    // send regardless of the Supabase "Enable email confirmations" toggle, making
    // it far more reliable than auth.resend which silently no-ops when that setting
    // is off or rate-limits are hit.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (otpError) throw otpError
    return { needsConfirmation: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const refreshCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await fetchProfile(session.user.id)
      // Respect the active flag — a deactivated user must not be re-admitted
      if (profile && profile.active !== false) {
        setCurrentUser(profile)
      } else {
        setCurrentUser(null)
        await supabase.auth.signOut()
      }
    }
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, refreshCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
