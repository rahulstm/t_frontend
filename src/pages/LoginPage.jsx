import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Could not log in. Check your email and password.')
    }
  }

  return (
    <section className="page-shell auth-page">
      <div className="form-card">
        <h1>Log in</h1>
        <p className="lead">Welcome back. Use the account you registered with.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button type="submit" className="button">
            Continue
          </button>
        </form>
        <p className="form-footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </section>
  )
}
