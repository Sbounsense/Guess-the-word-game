import { createContext, useContext, useState, useEffect } from 'react'
import { storage } from '../services/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = storage.getCurrentUserId()
    if (id) {
      const user = storage.getUser(id)
      if (user && user.active !== false) setCurrentUser(user)
      else storage.clearCurrentUser()
    }
    setLoading(false)
  }, [])

  const login = (user) => {
    storage.setCurrentUserId(user.id)
    setCurrentUser(user)
  }

  const logout = () => {
    storage.clearCurrentUser()
    setCurrentUser(null)
  }

  const refreshCurrentUser = () => {
    if (currentUser) {
      const fresh = storage.getUser(currentUser.id)
      if (fresh) setCurrentUser(fresh)
    }
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, refreshCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
