import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProjects } from '../services/project.js'
import { fetchDashboardOverview } from '../services/task.js'
import { priorityClass, statusClass } from '../utils/taskUi.js'

const statusLabels = ['To Do', 'In Progress', 'Done']

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState(null)
  const [tasksByUser, setTasksByUser] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [projectList, overview] = await Promise.all([fetchProjects(), fetchDashboardOverview()])
        if (cancelled) return
        setProjects(projectList)
        setStats(overview.stats)
        setTasksByUser(overview.tasksByUser)
        setRecentTasks(overview.tasks.slice(0, 6))
      } catch {
        if (!cancelled) {
          setError('Could not load the dashboard. Check that the backend API is reachable.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const statusCounts = useMemo(() => {
    const base = { 'To Do': 0, 'In Progress': 0, Done: 0 }
    if (!stats) return base
    return {
      'To Do': stats.todo,
      'In Progress': stats.inProgress,
      Done: stats.completed,
    }
  }, [stats])

  if (loading) {
    return (
      <section className="page-shell">
        <p className="muted">Loading your workspace…</p>
      </section>
    )
  }

  return (
    <section className="page-shell dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-lead">Track totals, status mix, workload, and overdue work across your teams.</p>
        </div>
        <Link to="/projects" className="button secondary">
          Open projects
        </Link>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <div className="stats-grid">
        <div className="stat-card">
          <span>Projects</span>
          <strong>{projects.length}</strong>
        </div>
        <div className="stat-card">
          <span>Total tasks</span>
          <strong>{stats?.total ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span>Overdue</span>
          <strong>{stats?.overdue ?? 0}</strong>
        </div>
      </div>

      <div className="status-grid">
        {statusLabels.map((label) => (
          <div key={label} className={`status-card status-card-${label.replace(/\s+/g, '-').toLowerCase()}`}>
            <span>{label}</span>
            <strong>{statusCounts[label]}</strong>
          </div>
        ))}
      </div>

      <section className="section-card">
        <h2>Tasks per assignee</h2>
        {tasksByUser.length === 0 ? (
          <p className="muted">No assignee data yet. Create tasks and assign teammates in a project.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Teammate</th>
                  <th>Tasks</th>
                </tr>
              </thead>
              <tbody>
                {tasksByUser.map((row, index) => (
                  <tr key={`${row.name}-${index}`}>
                    <td>{row.name}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section-card">
        <h2>Recent tasks</h2>
        {recentTasks.length === 0 ? (
          <p className="muted">No tasks yet. Open a project and add your first task.</p>
        ) : (
          <div className="task-list">
            {recentTasks.map((task) => (
              <div key={task._id} className="task-card-modern task-card-compact">
                <div className="task-card-body">
                  <h3 className="task-card-title">{task.title}</h3>
                  {task.description ? <p className="task-card-desc">{task.description}</p> : null}
                </div>
                <div className="task-toolbar task-toolbar-compact">
                  <span className={statusClass(task.status)}>{task.status}</span>
                  <span className={priorityClass(task.priority)}>{task.priority}</span>
                  {task.dueDate ? (
                    <span className="task-meta-item">{new Date(task.dueDate).toLocaleDateString()}</span>
                  ) : (
                    <span className="task-meta-item muted">No due date</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
