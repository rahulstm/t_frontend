import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      await signup(name, email, password)
      navigate('/')
    } catch {
      setError('Could not create your account. The email may already be in use.')
    }
  }

  return (
    <section className="page-shell auth-page">
      <div className="form-card">
        <h1>Create account</h1>
        <p className="lead">
          Sign up with your name and email. <strong>Admin</strong> and <strong>Member</strong> in the brief are{' '}
          <em>per project</em>: the creator is Admin; invited users are Members. Admins manage tasks and the team; Members
          only see and update tasks assigned to them.
        </p>
        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </label>
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
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button type="submit" className="button">
            Create account
          </button>
        </form>
        <p className="form-footer">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  )
}
