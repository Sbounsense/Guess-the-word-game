import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setCurrentUser(data || null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadProfile(session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await loadProfile(session.user.id)
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email, password, name, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })
    return { data, error }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
  }

  const refreshCurrentUser = async () => {
    if (currentUser) await loadProfile(currentUser.id)
  }

  const updateProfile = async (updates) => {
    if (!currentUser) return
    await supabase.from('profiles').update(updates).eq('id', currentUser.id)
    setCurrentUser(prev => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, signIn, signUp, logout, refreshCurrentUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
