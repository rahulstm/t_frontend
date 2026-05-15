import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { createTask, deleteTask, updateTask } from '../services/task.js'
import {
  addProjectMember,
  fetchProject,
  fetchProjectTasks,
  removeProjectMember,
} from '../services/project.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { priorityClass } from '../utils/taskUi.js'

const statusOptions = ['To Do', 'In Progress', 'Done']
const priorityOptions = ['Low', 'Medium', 'High']

function isAssignmentAdmin(user, project) {
  if (!user || !project) return false
  if (project.roleInProject === 'admin') return true
  if (project.roleInProject === 'member') return false
  if (user.role === 'Admin') return true
  const uid = String(user._id)
  const ownerId = project.ownerId ? String(project.ownerId) : ''
  if (ownerId && uid === ownerId) return true
  const membership = project.members?.find((m) => String(m._id) === uid)
  return membership?.role === 'Admin'
}

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [assigneeId, setAssigneeId] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [confirmBusy, setConfirmBusy] = useState(false)

  const isManager = useMemo(() => isAssignmentAdmin(user, project), [user, project])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!projectId) return
      setLoading(true)
      setError(null)
      try {
        const [projectData, projectTasks] = await Promise.all([
          fetchProject(projectId),
          fetchProjectTasks(projectId),
        ])
        if (cancelled) return
        setProject(projectData)
        setTasks(projectTasks)
      } catch {
        if (!cancelled) setError('Could not load this project. Check the link or your network.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  const overdueCount = useMemo(
    () =>
      tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done')
        .length,
    [tasks],
  )

  const memberOptions = useMemo(() => {
    const list = project?.members || []
    return list.filter((m) => m._id)
  }, [project])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!projectId) return
    setError(null)
    try {
      const created = await createTask(projectId, {
        title,
        description: description || '',
        dueDate: dueDate || null,
        priority,
        assigneeId: assigneeId || undefined,
      })
      setTasks((current) => [created, ...current])
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('Medium')
      setAssigneeId('')
    } catch {
      setError('Only project admins can create tasks, or the server rejected the payload.')
    }
  }

  const handleUpdateStatus = async (taskId, status) => {
    setError(null)
    try {
      const updated = await updateTask(taskId, { status })
      setTasks((current) => current.map((t) => (t._id === updated._id ? updated : t)))
    } catch {
      setError('Could not update that task.')
    }
  }

  const requestDeleteTask = (task) => {
    setConfirmTarget({
      kind: 'deleteTask',
      id: task._id,
      label: task.title || 'this task',
    })
  }

  const runConfirmedAction = async () => {
    if (!confirmTarget || !projectId) return
    setConfirmBusy(true)
    setError(null)
    try {
      if (confirmTarget.kind === 'removeMember') {
        const updated = await removeProjectMember(projectId, confirmTarget.id)
        setProject(updated)
      } else if (confirmTarget.kind === 'deleteTask') {
        await deleteTask(confirmTarget.id)
        setTasks((current) => current.filter((t) => t._id !== confirmTarget.id))
      }
      setConfirmTarget(null)
    } catch {
      if (confirmTarget.kind === 'removeMember') {
        setError('Could not remove that member.')
      } else {
        setError('Only project admins can delete tasks.')
      }
    } finally {
      setConfirmBusy(false)
    }
  }

  const handleInvite = async (event) => {
    event.preventDefault()
    if (!projectId) return
    setError(null)
    try {
      const updated = await addProjectMember(projectId, { email: inviteEmail.trim(), role: 'member' })
      setProject(updated)
      setInviteEmail('')
    } catch {
      setError('Could not add that member. Check the email or permissions.')
    }
  }

  const requestRemoveMember = (m) => {
    setConfirmTarget({
      kind: 'removeMember',
      id: m._id,
      label: m.name || m.email || 'this member',
    })
  }

  if (loading) {
    return (
      <section className="page-shell">
        <p className="muted">Loading project…</p>
      </section>
    )
  }

  if (!project) {
    return (
      <section className="page-shell">
        <p>Project not found.</p>
      </section>
    )
  }

  return (
    <section className="page-shell project-detail-page">
      <ConfirmDialog
        open={!!confirmTarget}
        title={
          confirmTarget?.kind === 'removeMember'
            ? 'Remove from project?'
            : 'Delete task?'
        }
        message={
          confirmTarget?.kind === 'removeMember'
            ? `Remove ${confirmTarget.label} from “${project.name}”? They will lose access until an admin invites them again.`
            : `Permanently delete “${confirmTarget?.label}”? This cannot be undone.`
        }
        cancelLabel="Cancel"
        confirmLabel={confirmTarget?.kind === 'removeMember' ? 'Remove member' : 'Delete task'}
        danger
        onCancel={() => !confirmBusy && setConfirmTarget(null)}
        onConfirm={runConfirmedAction}
        confirmLoading={confirmBusy}
      />

      <div className="page-heading">
        <div>
          <h1>{project.name}</h1>
          {project.description ? <p>{project.description}</p> : null}
          <span className="pill">
            {tasks.length} tasks · {overdueCount} overdue
            {isManager ? ' · Admin: manage tasks & team' : ' · Member: your assigned tasks only'}
          </span>
        </div>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      {isManager ? (
        <div className="section-card team-card">
          <h2 className="card-section-title">Team</h2>
          <p className="muted small team-card-lead">Invite by email or remove members. Only admins manage the team.</p>
          <form className="team-invite-form" onSubmit={handleInvite}>
            <label className="team-invite-label">
              <span className="team-invite-label-text">Email address</span>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                autoComplete="email"
                required
              />
            </label>
            <div className="team-invite-actions">
              <button type="submit" className="button">
                Add member
              </button>
            </div>
          </form>
          <ul className="member-list">
            {(project.members || []).map((m) => {
              const isSelf = String(m._id) === String(user?._id)
              const isOwner = project.ownerId && String(project.ownerId) === String(m._id)
              const displayName = (m.name || '').trim() || m.email
              return (
                <li key={m._id} className="member-row">
                  <div className="member-info">
                    <div className="member-name-line">
                      <span className="member-name">{displayName}</span>
                      <span className="role-pill">{m.role}</span>
                      {isOwner ? <span className="role-pill role-pill-owner">Owner</span> : null}
                    </div>
                    {m.email && displayName !== m.email ? (
                      <span className="member-email muted small">{m.email}</span>
                    ) : null}
                  </div>
                  {!isOwner && !isSelf ? (
                    <button
                      type="button"
                      className="button ghost small-btn"
                      onClick={() => requestRemoveMember(m)}
                    >
                      Remove
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <div className="section-card project-detail-grid">
        {isManager ? (
          <div className="project-detail-column">
            <h2 className="card-section-title">Create task</h2>
            <p className="muted small">Admins create tasks, set priority, due date, and assign teammates.</p>
            <form onSubmit={handleCreate}>
              <label>
                Title
                <input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </label>
              <label>
                Description <span className="optional">optional</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </label>
              <label>
                Due date <span className="optional">optional</span>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </label>
              <label>
                Priority
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Assign to <span className="optional">optional</span>
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {memberOptions.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name || m.email}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="button">
                Add task
              </button>
            </form>
          </div>
        ) : (
          <div className="project-detail-column muted">
            <h2 className="card-section-title">Member access</h2>
            <p>
              You are a <strong>Member</strong> on this project: you only see tasks assigned to you, and you may update
              their <strong>status</strong> (To Do / In Progress / Done). Admins handle creating tasks, assignments, and
              the team list.
            </p>
          </div>
        )}

        <div className="project-detail-column">
          <h2 className="card-section-title">Tasks</h2>
          {tasks.length === 0 ? (
            <p className="muted">
              {isManager
                ? 'No tasks yet. Use the form to add the first one.'
                : 'Nothing assigned to you in this project yet. Ask an admin to assign a task to you.'}
            </p>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article key={task._id} className="task-card-modern">
                  <div className="task-card-body">
                    <h3 className="task-card-title">{task.title}</h3>
                    {task.description ? <p className="task-card-desc">{task.description}</p> : null}
                    <div className="task-card-meta-row">
                      {task.assignee?.name || task.assignee?.email ? (
                        <span className="task-meta-item">
                          Assigned to {task.assignee.name || task.assignee.email}
                        </span>
                      ) : (
                        <span className="task-meta-item muted">Unassigned</span>
                      )}
                      {task.dueDate ? (
                        <span className="task-meta-item">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="task-toolbar">
                    <div className="task-toolbar-field">
                      <span className="toolbar-label">Status</span>
                      <select
                        className={`toolbar-select toolbar-select-${task.status.replace(/\s+/g, '-').toLowerCase()}`}
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                        aria-label={`Status for ${task.title}`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className={priorityClass(task.priority)}>{task.priority}</span>
                    {isManager ? (
                      <button
                        type="button"
                        className="button btn-delete small-btn"
                        onClick={() => requestDeleteTask(task)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
