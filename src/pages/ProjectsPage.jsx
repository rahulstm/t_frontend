import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createProject, fetchProjects } from '../services/project.js'
import { projectStatusClass } from '../utils/taskUi.js'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const list = await fetchProjects()
        if (!cancelled) setProjects(list)
      } catch {
        if (!cancelled) setError('Could not load projects. Is the backend running on port 5000?')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleCreate = async (event) => {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const created = await createProject({ name, description: description || '' })
      setProjects((current) => [created, ...current])
      setName('')
      setDescription('')
    } catch {
      setError('Could not create the project. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-shell projects-page">
      <div className="page-heading">
        <div>
          <h1>Projects</h1>
          <p className="page-lead">
            Create a project to become its admin, invite members by email, and track tasks together.
          </p>
        </div>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <div className="section-card project-form-card">
        <h2 className="card-section-title">New project</h2>
        <p className="muted small form-section-lead">You become the project admin and can invite teammates after creation.</p>
        <form className="stack-form" onSubmit={handleCreate}>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website redesign"
              required
            />
            <span className="field-hint">Choose a clear name your team will recognize in the dashboard.</span>
          </label>
          <label className="field">
            <span className="field-label">
              Description <span className="optional">optional</span>
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="button" disabled={saving}>
              {saving ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>

      <div className="section-card projects-list-section">
        <div className="section-head-row">
          <h2 className="card-section-title">Your projects</h2>
          <span className="projects-count">{projects.length} total</span>
        </div>
        {projects.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No projects yet</p>
            <p className="muted">Create your first project above to start assigning tasks.</p>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((project) => {
              const memberCount = project.memberCount ?? project.members?.length ?? 0
              const statusKey = project.status === 'completed' ? 'completed' : 'active'
              return (
                <Link key={project._id} to={`/projects/${project._id}`} className="project-card-modern">
                  <div className="project-card-top">
                    <span className="project-card-icon" aria-hidden="true">
                      {project.name.charAt(0).toUpperCase()}
                    </span>
                    <span className={projectStatusClass(statusKey)}>
                      {statusKey === 'completed' ? 'Completed' : 'Active'}
                    </span>
                  </div>
                  <h3 className="project-card-title">{project.name}</h3>
                  {project.description ? (
                    <p className="project-card-desc">{project.description}</p>
                  ) : (
                    <p className="project-card-desc muted">No description</p>
                  )}
                  <div className="project-card-footer">
                    <span className="project-card-meta">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </span>
                    <span className="project-card-cta">Open →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
