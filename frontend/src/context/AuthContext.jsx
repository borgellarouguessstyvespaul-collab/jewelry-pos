import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await authService.getMe()
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (err) {
          console.error('Failed to verify token:', err)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    const response = await authService.login(email, password)
    const { access_token, user: userData } = response
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const switchRole = (newRole) => {
    if (!user) return
    const updated = { ...user, role: newRole }
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        switchRole,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

