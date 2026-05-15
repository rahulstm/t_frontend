import { useEffect, useMemo, useState } from 'react'
import { login as loginRequest, signup as signupRequest } from '../services/auth.js'
import { AuthContext } from './auth-context.js'

const STORAGE_TOKEN = 'task_manager_token'
const STORAGE_USER = 'task_manager_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(STORAGE_USER)
    return raw ? JSON.parse(raw) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) localStorage.setItem(STORAGE_TOKEN, token)
    else localStorage.removeItem(STORAGE_TOKEN)
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_USER, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_USER)
  }, [user])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await loginRequest(email, password)
      setToken(response.token)
      setUser(response.user)
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    setLoading(true)
    try {
      const response = await signupRequest(name, email, password)
      setToken(response.token)
      setUser(response.user)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, token, loading, login, signup, logout }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
