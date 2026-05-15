import { useEffect, useMemo, useState } from 'react'
import {
  getProfile,
  login as loginRequest,
  signup as signupRequest,
} from '../services/auth.js'
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
  const [initializing, setInitializing] = useState(() => !!localStorage.getItem(STORAGE_TOKEN))

  useEffect(() => {
    if (token) localStorage.setItem(STORAGE_TOKEN, token)
    else localStorage.removeItem(STORAGE_TOKEN)
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_USER, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_USER)
  }, [user])

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_TOKEN)) return

    let cancelled = false
    async function hydrateSession() {
      try {
        const response = await getProfile()
        if (cancelled) return
        setToken(response.token)
        setUser(response.user)
      } catch {
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }

    hydrateSession()
    return () => {
      cancelled = true
    }
  }, [])

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
    () => ({ user, token, loading: loading || initializing, login, signup, logout }),
    [user, token, loading, initializing],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
