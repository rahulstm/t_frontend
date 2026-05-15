import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

export default function NavBar() {
  const { user, logout } = useAuth()

  return (
    <header className="nav-bar">
      <div className="nav-brand">
        <Link to="/">Team Task Manager</Link>
      </div>
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/projects">Projects</Link>
      </nav>
      <div className="nav-actions">
        {user ? (
          <>
            <span className="nav-user">
              {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()} · {user.role}
            </span>
            <button type="button" onClick={logout} className="button secondary">
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="button">
            Log in
          </Link>
        )}
      </div>
    </header>
  )
}
